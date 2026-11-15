import { EntitySchema } from "typeorm";

export const StockOutEntryEntity = new EntitySchema({
  name: "StockOutEntry",
  tableName: "tbl_stockOutEntry",
  columns: {
    id: {
      name: "Id",
      type: "int",
      primary: true,
      generated: true,
    },
    srNo: {
      name: "SrNo",
      type: "int",
    },
    birds: {
      name: "Birds",
      type: "int",
    },
    weight: {
      name: "Weight",
      type: "numeric",
    },
    stockOutMasterId: {
      name: "StockOutMasterId",
      type: "int",
    },
  },
  relations: {
    stockOut: {
      type: "many-to-one",
      target: "StockOutMaster",
      joinColumn: { name: "StockOutMasterId" },
      onDelete: "CASCADE",
    },
  },
});

export default StockOutEntryEntity;
