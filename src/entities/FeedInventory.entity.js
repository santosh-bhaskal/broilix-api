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
      nullable: true,
    },
    driverPhoneNumber: {
      name: "DriverPhoneNumber",
      type: "text",
      nullable: true,
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
      name: "IDX_feed_batch_date",
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

export default FeedInventoryEntity;
