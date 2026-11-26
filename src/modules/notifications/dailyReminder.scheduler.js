import { AppDataSource } from "../../core/database/dbConnect.js";
import { BATCH_STATUS } from "../../core/constants/constants.js";
import logger from "../../core/utils/logger.js";
import { sendToUser } from "./notification.service.js";

const REMINDER_HOURS = new Set([17, 18, 20]); // 5 PM, 6 PM, 8 PM
const TIMEZONE = process.env.REMINDER_TIMEZONE || "Asia/Kolkata";
const CHECK_INTERVAL_MS = 60 * 1000;

let timerId = null;
const sentSlotKeys = new Set();

function getZonedParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    dateStr: `${map.year}-${map.month}-${map.day}`,
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

function formatHourLabel(hour) {
  const h12 = hour > 12 ? hour - 12 : hour;
  return `${h12}:00 PM`;
}

export const runDailyReminderCheck = async (hour, dateStr) => {
  if (!AppDataSource.isInitialized) return { checked: 0, sent: 0 };

  const batchRepo = AppDataSource.getRepository("Batch");
  const dailyRepo = AppDataSource.getRepository("DailyRecord");

  const ongoingBatches = await batchRepo.find({
    where: { status: BATCH_STATUS.ONGOING, isDeleted: false },
  });

  let sentCount = 0;
  const timeLabel = formatHourLabel(hour);

  for (const batch of ongoingBatches) {
    if (!batch.userId) continue;

    // Skip if today's daily record has already been logged for this batch
    const existingToday = await dailyRepo
      .createQueryBuilder("d")
      .where("d.batchId = :batchId", { batchId: batch.id })
      .andWhere("d.isDeleted = false")
      .andWhere(`TO_CHAR(d."Date" AT TIME ZONE :tz, 'YYYY-MM-DD') = :dateStr`, {
        tz: TIMEZONE,
        dateStr,
      })
      .getOne();

    if (existingToday) continue;

    try {
      const res = await sendToUser(batch.userId, {
        title: `Daily Log Reminder (${timeLabel})`,
        body: `Batch #${batch.batchNo} is ongoing. Please log today's feed consumption and mortality.`,
        data: { type: "daily_reminder", batchId: batch.id, hour },
      });
      sentCount += res.sent || 0;
    } catch (err) {
      logger.warn(`Daily reminder failed for batch #${batch.id}: ${err.message}`);
    }
  }

  logger.info(
    `Daily reminder (${timeLabel} ${TIMEZONE}) checked ${ongoingBatches.length} ongoing batch(es), sent ${sentCount} notification(s).`
  );
  return { checked: ongoingBatches.length, sent: sentCount };
};

const tick = async () => {
  const { dateStr, hour, minute } = getZonedParts();
  if (!REMINDER_HOURS.has(hour) || minute >= 5) return;

  const slotKey = `${dateStr}-${hour}`;
  if (sentSlotKeys.has(slotKey)) return;

  sentSlotKeys.add(slotKey);
  // Keep memory bounded to recent days
  if (sentSlotKeys.size > 30) {
    const oldest = sentSlotKeys.values().next().value;
    sentSlotKeys.delete(oldest);
  }

  try {
    await runDailyReminderCheck(hour, dateStr);
  } catch (err) {
    logger.error(`Daily reminder scheduler error: ${err.message}`);
  }
};

export const startDailyReminderScheduler = () => {
  if (timerId) return;
  timerId = setInterval(() => {
    void tick();
  }, CHECK_INTERVAL_MS);
  if (typeof timerId.unref === "function") {
    timerId.unref();
  }
  logger.info(`Daily reminder scheduler active (5 PM, 6 PM, 8 PM ${TIMEZONE}).`);
};

export const stopDailyReminderScheduler = () => {
  if (!timerId) return;
  clearInterval(timerId);
  timerId = null;
};
