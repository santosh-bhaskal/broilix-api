import "reflect-metadata";
import { DataSource } from "typeorm";
import config from "../src/core/config/env.config.js";
import { entities } from "../src/entities/index.js";

const MigrationDataSource = new DataSource({
  type: "postgres",
  url: config.databaseUrl,
  ssl: { rejectUnauthorized: false },
  synchronize: false,
  logging: ["error", "warn"],
  entities,
});

async function run() {
  console.log("Connecting to PostgreSQL...");
  await MigrationDataSource.initialize();
  const queryRunner = MigrationDataSource.createQueryRunner();

  try {
    console.log("Step 1: Running pre-migration data cleanup...");

    // 0. Ensure FirstName / LastName / Email have no NULLs or duplicate Emails
    await queryRunner.query(`UPDATE tbl_user SET "FirstName" = '' WHERE "FirstName" IS NULL;`);
    await queryRunner.query(`UPDATE tbl_user SET "LastName" = '' WHERE "LastName" IS NULL;`);

    // 1. Backfill NULL UserId on tbl_batch to the earliest user
    await queryRunner.query(`
      UPDATE tbl_batch
      SET "UserId" = (SELECT "Id" FROM tbl_user ORDER BY "Id" ASC LIMIT 1)
      WHERE "UserId" IS NULL
        AND EXISTS (SELECT 1 FROM tbl_user);
    `);

    // 2. Normalize nullable IsDeleted flags to false
    await queryRunner.query(`UPDATE "tbl_birdInventory" SET "IsDeleted" = false WHERE "IsDeleted" IS NULL;`);
    await queryRunner.query(`UPDATE "tbl_feedInventory" SET "IsDeleted" = false WHERE "IsDeleted" IS NULL;`);
    await queryRunner.query(`UPDATE "tbl_dailyRegister" SET "IsDeleted" = false WHERE "IsDeleted" IS NULL;`);

    // 3. Make nullable DriverName / DriverPhoneNumber safe (already nullable in new schema)
    // 4. Drop legacy global unique constraint/index on tbl_finalReport.BatchId
    await queryRunner.query(`ALTER TABLE "tbl_finalReport" DROP CONSTRAINT IF EXISTS "IX_tbl_finalReport_BatchId";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IX_tbl_finalReport_BatchId";`);

    // 5. Ensure at most 1 ongoing batch per user before adding UQ_batch_one_ongoing_per_user
    await queryRunner.query(`
      WITH ranked AS (
        SELECT "Id",
               ROW_NUMBER() OVER (PARTITION BY "UserId" ORDER BY "Id" DESC) AS rn
        FROM tbl_batch
        WHERE "Status" = 0 AND "IsDeleted" = false
      )
      UPDATE tbl_batch
      SET "Status" = 1, "EndDate" = COALESCE("EndDate", NOW())
      WHERE "Id" IN (SELECT "Id" FROM ranked WHERE rn > 1);
    `);

    // 6. Ensure unique (UserId, BatchNo) for active batches by renumbering duplicates if any
    await queryRunner.query(`
      WITH dupes AS (
        SELECT "Id",
               ROW_NUMBER() OVER (PARTITION BY "UserId", "BatchNo" ORDER BY "Id" ASC) AS rn,
               MAX("BatchNo") OVER (PARTITION BY "UserId") AS max_no
        FROM tbl_batch
        WHERE "IsDeleted" = false
      )
      UPDATE tbl_batch b
      SET "BatchNo" = d.max_no + d.rn - 1
      FROM dupes d
      WHERE b."Id" = d."Id" AND d.rn > 1;
    `);

    console.log("Step 2: Synchronizing redesigned TypeORM entity schemas...");
    await MigrationDataSource.synchronize();

    console.log("Step 3: Backfilling StockOutMaster Status (1 = FINALIZED if TotalBirds > 0)...");
    await queryRunner.query(`
      UPDATE "tbl_stockOut"
      SET "Status" = CASE WHEN "TotalBirds" > 0 THEN 1 ELSE 0 END
      WHERE "TotalBirds" > 0 AND "Status" = 0;
    `);

    console.log("Database migration completed successfully!");
  } finally {
    await queryRunner.release();
    await MigrationDataSource.destroy();
  }
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
