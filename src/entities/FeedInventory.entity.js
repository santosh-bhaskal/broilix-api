import { EntitySchema } from "typeorm";

export const FeedInventoryEntity = new EntitySchema({
  name: "FeedInventory",
  tableName: "tbl_feedInventory",
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
    feedName: {
      name: "FeedName",
      type: "text",
    },
    bagsArrivedCount: {
      name: "BagsArrivedCount",
      type: "int",
    },
    driverName: {
      name: "DriverName",
      type: "text",
    },
    driverPhoneNumber: {
      name: "DriverPhoneNumber",
      type: "text",
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

export default FeedInventoryEntity;
