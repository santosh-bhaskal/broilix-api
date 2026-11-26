import { EntitySchema } from "typeorm";

export const StockOutMasterEntity = new EntitySchema({
  name: "StockOutMaster",
  tableName: "tbl_stockOut",
  columns: {
    id: {
      name: "Id",
      type: "int",
      primary: true,
      generated: true,
    },
    date: {
      name: "Date",
      type: "timestamptz",
    },
    batchId: {
      name: "BatchId",
      type: "int",
    },
    stockOutNo: {
      name: "StockOutNo",
      type: "int",
    },
    status: {
      name: "Status",
      type: "smallint",
      default: 0,
    },
    totalBirds: {
      name: "TotalBirds",
      type: "int",
      default: 0,
    },
    totalWeight: {
      name: "TotalWeight",
      type: "numeric",
      precision: 10,
      scale: 2,
      default: 0,
    },
    avgWeight: {
      name: "AvgWeight",
      type: "numeric",
      precision: 10,
      scale: 2,
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
      name: "IDX_stockout_batch",
      columns: ["batchId", "isDeleted"],
    },
  ],
  relations: {
    batch: {
      type: "many-to-one",
      target: "Batch",
      joinColumn: { name: "BatchId" },
      onDelete: "CASCADE",
    },
    entries: {
      type: "one-to-many",
      target: "StockOutEntry",
      inverseSide: "stockOut",
    },
  },
});

export default StockOutMasterEntity;
