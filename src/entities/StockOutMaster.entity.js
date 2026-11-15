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
    totalBirds: {
      name: "TotalBirds",
      type: "int",
      default: 0,
    },
    totalWeight: {
      name: "TotalWeight",
      type: "numeric",
      default: 0,
    },
    avgWeight: {
      name: "AvgWeight",
      type: "numeric",
      default: 0,
    },
    isDeleted: {
      name: "IsDeleted",
      type: "boolean",
      default: false,
    },
  },
  relations: {
    batch: {
      type: "many-to-one",
      target: "Batch",
      joinColumn: { name: "BatchId" },
      onDelete: "RESTRICT",
    },
    entries: {
      type: "one-to-many",
      target: "StockOutEntry",
      inverseSide: "stockOut",
    },
  },
});

export default StockOutMasterEntity;
