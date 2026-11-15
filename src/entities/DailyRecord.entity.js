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
    },
    mortalityCount: {
      name: "MortalityCount",
      type: "int",
    },
    isDeleted: {
      name: "IsDeleted",
      type: "boolean",
      nullable: true,
      default: false,
    },
  },
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
