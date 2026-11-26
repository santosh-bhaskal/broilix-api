-- Pre-migration cleanup script before applying redesigned TypeORM entities
-- Run this against PostgreSQL if upgrading an existing database with legacy NULL rows.

-- 1. Backfill any legacy batches without a UserId (replace 1 with the target owner user Id)
UPDATE tbl_batch
SET "UserId" = (SELECT "Id" FROM tbl_user ORDER BY "Id" ASC LIMIT 1)
WHERE "UserId" IS NULL;

-- 2. Normalize nullable IsDeleted flags to false
UPDATE tbl_birdInventory SET "IsDeleted" = false WHERE "IsDeleted" IS NULL;
UPDATE tbl_feedInventory SET "IsDeleted" = false WHERE "IsDeleted" IS NULL;
UPDATE tbl_dailyRegister SET "IsDeleted" = false WHERE "IsDeleted" IS NULL;

-- 3. Drop legacy global unique index on tbl_finalReport.BatchId (replaced by partial unique index)
ALTER TABLE tbl_finalReport DROP CONSTRAINT IF EXISTS "IX_tbl_finalReport_BatchId";
DROP INDEX IF EXISTS "IX_tbl_finalReport_BatchId";

-- 4. Backfill StockOutMaster Status (1 = FINALIZED if TotalBirds > 0, else 0 = OPEN)
-- Note: Run after TypeORM adds the "Status" column, or add it first if synchronize is disabled:
-- ALTER TABLE tbl_stockOut ADD COLUMN IF NOT EXISTS "Status" smallint NOT NULL DEFAULT 0;
UPDATE tbl_stockOut
SET "Status" = CASE WHEN "TotalBirds" > 0 THEN 1 ELSE 0 END
WHERE "Status" IS NULL OR ("TotalBirds" > 0 AND "Status" = 0);
