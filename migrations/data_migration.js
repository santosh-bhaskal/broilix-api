import "reflect-metadata";
import { DataSource } from "typeorm";
import config from "../src/core/config/env.config.js";
import { entities } from "../src/entities/index.js";

const DataMigrationSource = new DataSource({
  type: "postgres",
  url: config.databaseUrl,
  ssl: { rejectUnauthorized: false },
  synchronize: false,
  logging: ["error"],
  entities,
});

async function run() {
  console.log("Connecting to PostgreSQL for data migration...");
  await DataMigrationSource.initialize();
  const qr = DataMigrationSource.createQueryRunner();

  try {
    const tables = [
      "tbl_user",
      "tbl_batch",
      "tbl_birdInventory",
      "tbl_feedInventory",
      "tbl_dailyRegister",
      "tbl_stockOut",
      "tbl_stockOutEntry",
      "tbl_finalReport",
      "tbl_pushToken",
    ];

    console.log("\n--- Current Row Counts ---");
    for (const t of tables) {
      const [{ cnt }] = await qr.query(`SELECT COUNT(*)::int AS cnt FROM "${t}"`);
      console.log(`  ${t}: ${cnt}`);
    }

    console.log("\n--- Running Data Migrations ---");

    // 1. Mark any batch that already has an active FinalReport as COMPLETED (Status = 1) with EndDate
    const res1 = await qr.query(`
      UPDATE tbl_batch b
      SET "Status" = 1,
          "EndDate" = COALESCE(b."EndDate", f."EndDate", NOW())
      FROM "tbl_finalReport" f
      WHERE f."BatchId" = b."Id"
        AND f."IsDeleted" = false
        AND b."IsDeleted" = false
        AND (b."Status" = 0 OR b."EndDate" IS NULL);
    `);
    console.log(`  1. Synced batches with FinalReports -> COMPLETED: ${res1[1] ?? 0} rows`);

    // 2. Backfill Breed and TargetCycleDays on tbl_batch where NULL
    const res2 = await qr.query(`
      UPDATE tbl_batch
      SET "Breed" = COALESCE("Breed", 'Broiler'),
          "TargetCycleDays" = COALESCE("TargetCycleDays", 42)
      WHERE "Breed" IS NULL OR "TargetCycleDays" IS NULL;
    `);
    console.log(`  2. Backfilled Batch Breed/TargetCycleDays: ${res2[1] ?? 0} rows`);

    // 3. Recalculate StockOutMaster totals & Status from StockOutEntry where entries exist
    const res3 = await qr.query(`
      WITH agg AS (
        SELECT "StockOutMasterId" AS master_id,
               COALESCE(SUM("Birds"), 0)::int AS sum_birds,
               COALESCE(SUM("Weight"), 0)::numeric(10,2) AS sum_weight
        FROM "tbl_stockOutEntry"
        WHERE "IsDeleted" = false
        GROUP BY "StockOutMasterId"
      )
      UPDATE "tbl_stockOut" m
      SET "TotalBirds" = agg.sum_birds,
          "TotalWeight" = agg.sum_weight,
          "AvgWeight" = CASE WHEN agg.sum_birds > 0 THEN ROUND(agg.sum_weight / agg.sum_birds, 2) ELSE 0 END,
          "Status" = CASE WHEN agg.sum_birds > 0 THEN 1 ELSE m."Status" END
      FROM agg
      WHERE m."Id" = agg.master_id
        AND m."IsDeleted" = false
        AND (m."TotalBirds" <> agg.sum_birds OR m."TotalWeight" <> agg.sum_weight);
    `);
    console.log(`  3. Synced StockOutMaster totals from entries: ${res3[1] ?? 0} rows`);

    // 4. Backfill BirdInventory.HousedBirdCount if 0/NULL while BirdsArrivedCount > 0
    const res4 = await qr.query(`
      UPDATE "tbl_birdInventory"
      SET "HousedBirdCount" = GREATEST(
        0,
        COALESCE("BirdsArrivedCount", 0) + COALESCE("ExcessBirdCount", 0)
        - (COALESCE("BoxMortalityCount", 0) + COALESCE("WeakBirdCount", 0) + COALESCE("DisabledBirdCount", 0) + COALESCE("ShortBirdCount", 0))
      )
      WHERE ("HousedBirdCount" IS NULL OR "HousedBirdCount" = 0)
        AND COALESCE("BirdsArrivedCount", 0) > 0;
    `);
    console.log(`  4. Backfilled BirdInventory HousedBirdCount: ${res4[1] ?? 0} rows`);

    // 5. Backfill CreatedAt / UpdatedAt where NULL across all tables
    const timestampTables = [
      "tbl_user",
      "tbl_batch",
      "tbl_birdInventory",
      "tbl_feedInventory",
      "tbl_dailyRegister",
      "tbl_stockOut",
      "tbl_stockOutEntry",
      "tbl_finalReport",
    ];
    for (const t of timestampTables) {
      await qr.query(`
        UPDATE "${t}"
        SET "CreatedAt" = COALESCE("CreatedAt", NOW()),
            "UpdatedAt" = COALESCE("UpdatedAt", NOW())
        WHERE "CreatedAt" IS NULL OR "UpdatedAt" IS NULL;
      `);
    }
    console.log("  5. Backfilled CreatedAt/UpdatedAt timestamps across all tables.");

    console.log("\nData migration completed successfully!");
  } finally {
    await qr.release();
    await DataMigrationSource.destroy();
  }
}

run().catch((err) => {
  console.error("Data migration failed:", err);
  process.exit(1);
});
