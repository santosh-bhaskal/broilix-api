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
      precision: 10,
      scale: 2,
    },
    stockOutMasterId: {
      name: "StockOutMasterId",
      type: "int",
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
      name: "IDX_stockout_entry_master",
      columns: ["stockOutMasterId"],
    },
  ],
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
