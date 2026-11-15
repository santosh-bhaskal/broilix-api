import { EntitySchema } from "typeorm";

export const BatchEntity = new EntitySchema({
  name: "Batch",
  tableName: "tbl_batch",
  columns: {
    id: {
      name: "Id",
      type: "int",
      primary: true,
      generated: true,
    },
    batchNo: {
      name: "BatchNo",
      type: "int",
    },
    startDate: {
      name: "StartDate",
      type: "timestamptz",
    },
    endDate: {
      name: "EndDate",
      type: "timestamptz",
      nullable: true,
    },
    status: {
      name: "Status",
      type: "int",
      default: 0,
    },
    isDeleted: {
      name: "IsDeleted",
      type: "boolean",
      default: false,
    },
    userId: {
      name: "UserId",
      type: "int",
      nullable: true,
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "UserId" },
      onDelete: "CASCADE",
      nullable: true,
    },
    birdInventory: {
      type: "one-to-one",
      target: "BirdInventory",
      inverseSide: "batch",
    },
    feedInventories: {
      type: "one-to-many",
      target: "FeedInventory",
      inverseSide: "batch",
    },
    dailyRecords: {
      type: "one-to-many",
      target: "DailyRecord",
      inverseSide: "batch",
    },
    stockOuts: {
      type: "one-to-many",
      target: "StockOutMaster",
      inverseSide: "batch",
    },
  },
});

export default BatchEntity;
