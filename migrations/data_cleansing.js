import "reflect-metadata";
import { DataSource } from "typeorm";
import config from "../src/core/config/env.config.js";
import { entities } from "../src/entities/index.js";

const CleansingDataSource = new DataSource({
  type: "postgres",
  url: config.databaseUrl,
  ssl: { rejectUnauthorized: false },
  synchronize: false,
  logging: ["error"],
  entities,
});

async function run() {
  console.log("Connecting to PostgreSQL for data cleansing...");
  await CleansingDataSource.initialize();
  const qr = CleansingDataSource.createQueryRunner();

  try {
    await qr.startTransaction();
    console.log("\n--- Running Data Cleansing ---");

    // 1. Trim whitespace and normalize user emails/names
    const resUsers = await qr.query(`
      UPDATE tbl_user
      SET "FirstName" = TRIM("FirstName"),
          "LastName" = TRIM("LastName"),
          "Email" = LOWER(TRIM("Email"))
      WHERE "FirstName" <> TRIM("FirstName")
         OR "LastName" <> TRIM("LastName")
         OR "Email" <> LOWER(TRIM("Email"));
    `);
    console.log(`  1. Normalized User names/emails: ${resUsers[1] ?? 0} rows`);

    // 2. Normalize empty/whitespace-only optional strings on FeedInventory to NULL
    const resFeed = await qr.query(`
      UPDATE "tbl_feedInventory"
      SET "FeedName" = TRIM("FeedName"),
          "DriverName" = NULLIF(TRIM(COALESCE("DriverName", '')), ''),
          "DriverPhoneNumber" = NULLIF(TRIM(COALESCE("DriverPhoneNumber", '')), '')
      WHERE "FeedName" <> TRIM("FeedName")
         OR "DriverName" = ''
         OR "DriverName" <> TRIM(COALESCE("DriverName", ''))
         OR "DriverPhoneNumber" = ''
         OR "DriverPhoneNumber" <> TRIM(COALESCE("DriverPhoneNumber", ''));
    `);
    console.log(`  2. Normalized FeedInventory text/nulls: ${resFeed[1] ?? 0} rows`);

    // 3. Clamp negative numeric counts to 0
    const resBirdNeg = await qr.query(`
      UPDATE "tbl_birdInventory"
      SET "BoxCount" = GREATEST(0, "BoxCount"),
          "BirdsPerBoxCount" = GREATEST(0, "BirdsPerBoxCount"),
          "BirdsArrivedCount" = GREATEST(0, "BirdsArrivedCount"),
          "BoxMortalityCount" = GREATEST(0, "BoxMortalityCount"),
          "DisabledBirdCount" = GREATEST(0, "DisabledBirdCount"),
          "WeakBirdCount" = GREATEST(0, "WeakBirdCount"),
          "ShortBirdCount" = GREATEST(0, "ShortBirdCount"),
          "ExcessBirdCount" = GREATEST(0, "ExcessBirdCount"),
          "HousedBirdCount" = GREATEST(0, "HousedBirdCount")
      WHERE "BoxCount" < 0 OR "BirdsPerBoxCount" < 0 OR "BirdsArrivedCount" < 0
         OR "BoxMortalityCount" < 0 OR "DisabledBirdCount" < 0 OR "WeakBirdCount" < 0
         OR "ShortBirdCount" < 0 OR "ExcessBirdCount" < 0 OR "HousedBirdCount" < 0;
    `);
    console.log(`  3. Clamped negative BirdInventory counts: ${resBirdNeg[1] ?? 0} rows`);

    const resDailyNeg = await qr.query(`
      UPDATE "tbl_dailyRegister"
      SET "FeedConsumedBags" = GREATEST(0, "FeedConsumedBags"),
          "MortalityCount" = GREATEST(0, "MortalityCount"),
          "BirdAgeInDays" = GREATEST(0, "BirdAgeInDays")
      WHERE "FeedConsumedBags" < 0 OR "MortalityCount" < 0 OR "BirdAgeInDays" < 0;
    `);
    console.log(`  4. Clamped negative DailyRecord counts: ${resDailyNeg[1] ?? 0} rows`);

    // 5. Deduplicate active DailyRecord entries per (BatchId, Date::date) — keep most recent Id
    const resDailyDup = await qr.query(`
      WITH ranked AS (
        SELECT "Id",
               ROW_NUMBER() OVER (PARTITION BY "BatchId", DATE("Date") ORDER BY "Id" DESC) AS rn
        FROM "tbl_dailyRegister"
        WHERE "IsDeleted" = false
      )
      UPDATE "tbl_dailyRegister"
      SET "IsDeleted" = true, "UpdatedAt" = NOW()
      WHERE "Id" IN (SELECT "Id" FROM ranked WHERE rn > 1);
    `);
    console.log(`  5. Soft-deleted duplicate DailyRecord logs (same batch & day): ${resDailyDup[1] ?? 0} rows`);

    // 6. Cascade soft-delete to child records of deleted batches
    const childTables = [
      "tbl_birdInventory",
      "tbl_feedInventory",
      "tbl_dailyRegister",
      "tbl_stockOut",
      "tbl_finalReport",
    ];
    let cascadedBatchChildren = 0;
    for (const t of childTables) {
      const r = await qr.query(`
        UPDATE "${t}" c
        SET "IsDeleted" = true, "UpdatedAt" = NOW()
        FROM tbl_batch b
        WHERE c."BatchId" = b."Id"
          AND b."IsDeleted" = true
          AND c."IsDeleted" = false;
      `);
      cascadedBatchChildren += r[1] ?? 0;
    }
    console.log(`  6. Soft-deleted orphaned child records of deleted batches: ${cascadedBatchChildren} rows`);

    // 7. Cascade soft-delete to StockOutEntry whose parent StockOutMaster is deleted
    const resEntryCascade = await qr.query(`
      UPDATE "tbl_stockOutEntry" e
      SET "IsDeleted" = true, "UpdatedAt" = NOW()
      FROM "tbl_stockOut" m
      WHERE e."StockOutMasterId" = m."Id"
        AND m."IsDeleted" = true
        AND e."IsDeleted" = false;
    `);
    console.log(`  7. Soft-deleted orphaned StockOutEntries of deleted masters: ${resEntryCascade[1] ?? 0} rows`);

    // 8. Reconcile StockOutMaster Status & totals (OPEN if 0 birds/entries)
    const resStockOutStatus = await qr.query(`
      UPDATE "tbl_stockOut"
      SET "Status" = 0, "AvgWeight" = 0, "TotalWeight" = 0, "UpdatedAt" = NOW()
      WHERE "IsDeleted" = false
        AND "Status" = 1
        AND "TotalBirds" = 0;
    `);
    console.log(`  8. Reset empty finalized StockOutMasters to OPEN: ${resStockOutStatus[1] ?? 0} rows`);

    // 9. Reconcile Batch EndDate vs Status
    const resBatchDates = await qr.query(`
      UPDATE tbl_batch
      SET "EndDate" = CASE
        WHEN "Status" = 0 THEN NULL
        WHEN "Status" = 1 AND "EndDate" IS NULL THEN NOW()
        ELSE "EndDate"
      END,
      "UpdatedAt" = NOW()
      WHERE ("Status" = 0 AND "EndDate" IS NOT NULL)
         OR ("Status" = 1 AND "EndDate" IS NULL);
    `);
    console.log(`  9. Reconciled Batch Status/EndDate consistency: ${resBatchDates[1] ?? 0} rows`);

    await qr.commitTransaction();
    console.log("\nData cleansing completed and committed successfully!");
  } catch (err) {
    if (qr.isTransactionActive) {
      await qr.rollbackTransaction();
    }
    throw err;
  } finally {
    await qr.release();
    await CleansingDataSource.destroy();
  }
}

run().catch((err) => {
  console.error("Data cleansing failed:", err);
  process.exit(1);
});
