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
    breed: {
      name: "Breed",
      type: "varchar",
      length: 80,
      nullable: true,
      default: "Broiler",
    },
    targetCycleDays: {
      name: "TargetCycleDays",
      type: "int",
      default: 42,
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
      name: "IDX_batch_user_status",
      columns: ["userId", "status", "isDeleted"],
    },
    {
      name: "UQ_batch_user_batchNo",
      columns: ["userId", "batchNo"],
      unique: true,
      where: '"IsDeleted" = false',
    },
    {
      name: "UQ_batch_one_ongoing_per_user",
      columns: ["userId"],
      unique: true,
      where: '"Status" = 0 AND "IsDeleted" = false',
    },
  ],
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "UserId" },
      onDelete: "CASCADE",
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
