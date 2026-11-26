import { EntitySchema } from "typeorm";

export const BirdInventoryEntity = new EntitySchema({
  name: "BirdInventory",
  tableName: "tbl_birdInventory",
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
    boxCount: {
      name: "BoxCount",
      type: "int",
    },
    birdsPerBoxCount: {
      name: "BirdsPerBoxCount",
      type: "int",
    },
    totalBirdCount: {
      name: "TotalBirdCount",
      type: "int",
    },
    birdsArrivedCount: {
      name: "BirdsArrivedCount",
      type: "int",
    },
    boxMortalityCount: {
      name: "BoxMortalityCount",
      type: "int",
    },
    disabledBirdCount: {
      name: "DisabledBirdCount",
      type: "int",
    },
    weakBirdCount: {
      name: "WeakBirdCount",
      type: "int",
    },
    shortBirdCount: {
      name: "ShortBirdCount",
      type: "int",
    },
    excessBirdCount: {
      name: "ExcessBirdCount",
      type: "int",
    },
    housedBirdCount: {
      name: "HousedBirdCount",
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
      name: "IDX_birdInventory_batch",
      columns: ["batchId", "isDeleted"],
    },
  ],
  relations: {
    batch: {
      type: "one-to-one",
      target: "Batch",
      joinColumn: { name: "BatchId" },
      onDelete: "CASCADE",
    },
  },
});

export default BirdInventoryEntity;
