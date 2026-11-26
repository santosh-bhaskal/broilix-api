import { Expo } from "expo-server-sdk";
import { AppDataSource } from "../../core/database/dbConnect.js";
import ApiError from "../../core/utils/ApiError.js";
import logger from "../../core/utils/logger.js";

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
const getPushTokenRepository = () => AppDataSource.getRepository("PushToken");

export const registerPushToken = async (userId, body) => {
  if (!Expo.isExpoPushToken(body.token)) {
    throw ApiError.badRequest("token must be a valid Expo push token.");
  }

  const repo = getPushTokenRepository();
  const existing = await repo.findOne({ where: { token: body.token } });
  const tokenRecord = existing || repo.create({ token: body.token });
  tokenRecord.userId = userId;
  tokenRecord.deviceId = body.deviceId || null;
  tokenRecord.platform = body.platform || null;
  await repo.save(tokenRecord);
  return { message: "Expo push token registered." };
};

export const unregisterPushToken = async (userId, token) => {
  const result = await getPushTokenRepository().delete({ userId, token });
  if (!result.affected) throw ApiError.notFound("Push token was not found.");
  return { message: "Expo push token removed." };
};

// Reusable from business services: sendToUser(userId, { title, body, data }).
export const sendToUser = async (userId, notification) => {
  const repo = getPushTokenRepository();
  const records = await repo.find({ where: { userId } });
  const validRecords = records.filter(({ token }) => Expo.isExpoPushToken(token));
  const invalidIds = records.filter(({ token }) => !Expo.isExpoPushToken(token)).map(({ id }) => id);
  if (invalidIds.length) await repo.delete(invalidIds);

  if (!validRecords.length) return { sent: 0, failed: 0, message: "No registered Expo devices." };

  const messages = validRecords.map(({ token }) => ({
    to: token,
    sound: "default",
    channelId: "default",
    title: notification.title,
    body: notification.body,
    data: notification.data || {},
  }));

  let sent = 0;
  let failed = 0;
  const revokedTokenIds = [];
  let offset = 0;
  for (const chunk of expo.chunkPushNotifications(messages)) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      tickets.forEach((ticket, index) => {
        if (ticket.status === "ok") sent += 1;
        else {
          failed += 1;
          logger.warn(`Expo push failed: ${ticket.message || "unknown error"}`);
          if (ticket.details?.error === "DeviceNotRegistered") revokedTokenIds.push(validRecords[offset + index]?.id);
        }
      });
    } catch (error) {
      failed += chunk.length;
      logger.error(`Expo push request failed: ${error.message}`);
    }
    offset += chunk.length;
  }
  const idsToRemove = revokedTokenIds.filter(Boolean);
  if (idsToRemove.length) await repo.delete(idsToRemove);
  return { sent, failed };
};
