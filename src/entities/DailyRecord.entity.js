import { EntitySchema } from "typeorm";

export const DailyRecordEntity = new EntitySchema({
  name: "DailyRecord",
  tableName: "tbl_dailyRegister",
  columns: {
    id: {
      name: "Id",
      type: "int",
      primary: true,
      generated: true,
    },
    batchId: {
      name: "BatchId",
      type: "int",
    },
    date: {
      name: "Date",
      type: "timestamptz",
    },
    birdAgeInDays: {
      name: "BirdAgeInDays",
      type: "int",
    },
    feedConsumedBags: {
      name: "FeedConsumedBags",
      type: "int",
      default: 0,
    },
    mortalityCount: {
      name: "MortalityCount",
      type: "int",
      default: 0,
    },
    isDeleted: {
      name: "IsDeleted",
      type: "boolean",
      default: false,
    },
    createdAt: {
      name: "CreatedAt",
      type: "timestamptz",
      createDate: true,
    },
    updatedAt: {
      name: "UpdatedAt",
      type: "timestamptz",
      updateDate: true,
    },
  },
  indices: [
    {
      name: "IDX_daily_batch_date",
      columns: ["batchId", "date"],
    },
  ],
  relations: {
    batch: {
      type: "many-to-one",
      target: "Batch",
      joinColumn: { name: "BatchId" },
      onDelete: "CASCADE",
    },
  },
});

export default DailyRecordEntity;
