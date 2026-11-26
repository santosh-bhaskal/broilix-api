import { EntitySchema } from "typeorm";

export const FinalReportEntity = new EntitySchema({
  name: "FinalReport",
  tableName: "tbl_finalReport",
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
    startDate: {
      name: "StartDate",
      type: "timestamptz",
    },
    endDate: {
      name: "EndDate",
      type: "timestamptz",
    },
    totalBirds: {
      name: "TotalBirds",
      type: "int",
    },
    birdRate: {
      name: "BirdRate",
      type: "numeric",
      precision: 10,
      scale: 2,
    },
    birdCost: {
      name: "BirdCost",
      type: "numeric",
      precision: 12,
      scale: 2,
    },
    totalBags: {
      name: "TotalBags",
      type: "int",
    },
    totalFeedKg: {
      name: "TotalFeedKg",
      type: "numeric",
      precision: 10,
      scale: 2,
    },
    feedRate: {
      name: "FeedRate",
      type: "numeric",
      precision: 10,
      scale: 2,
    },
    feedCost: {
      name: "FeedCost",
      type: "numeric",
      precision: 12,
      scale: 2,
    },
    totalSoldBirds: {
      name: "TotalSoldBirds",
      type: "int",
    },
    totalBirdsWeight: {
      name: "TotalBirdsWeight",
      type: "numeric",
      precision: 10,
      scale: 2,
    },
    avgBodyWeight: {
      name: "AvgBodyWeight",
      type: "numeric",
      precision: 10,
      scale: 2,
    },
    chicksCost: {
      name: "ChicksCost",
      type: "numeric",
      precision: 12,
      scale: 2,
    },
    medicineCost: {
      name: "MedicineCost",
      type: "numeric",
      precision: 12,
      scale: 2,
    },
    adminCost: {
      name: "AdminCost",
      type: "numeric",
      precision: 12,
      scale: 2,
    },
    grossProductionCost: {
      name: "GrossProductionCost",
      type: "numeric",
      precision: 12,
      scale: 2,
    },
    netCostPerKg: {
      name: "NetCostPerKg",
      type: "numeric",
      precision: 10,
      scale: 2,
    },
    stdCostPerKg: {
      name: "StdCostPerKg",
      type: "numeric",
      precision: 10,
      scale: 2,
    },
    rearingChargesStd: {
      name: "RearingChargesStd",
      type: "numeric",
      precision: 10,
      scale: 2,
    },
    productionCostIncentive: {
      name: "ProductionCostIncentive",
      type: "numeric",
      precision: 10,
      scale: 2,
    },
    rearingChargesPerBird: {
      name: "RearingChargesPerBird",
      type: "numeric",
      precision: 10,
      scale: 2,
    },
    totalRearingCharges: {
      name: "TotalRearingCharges",
      type: "numeric",
      precision: 12,
      scale: 2,
    },
    totalAmountPayable: {
      name: "TotalAmountPayable",
      type: "numeric",
      precision: 12,
      scale: 2,
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
      name: "UQ_finalReport_batch_active",
      columns: ["batchId"],
      unique: true,
      where: '"IsDeleted" = false',
    },
  ],
  relations: {
    batch: {
      type: "one-to-one",
      target: "Batch",
      joinColumn: { name: "BatchId" },
      inverseSide: "finalReport",
      onDelete: "RESTRICT",
    },
  },
});

export default FinalReportEntity;
