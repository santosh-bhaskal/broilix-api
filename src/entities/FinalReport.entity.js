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
      unique: true,
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
    },
    birdCost: {
      name: "BirdCost",
      type: "numeric",
    },
    totalBags: {
      name: "TotalBags",
      type: "int",
    },
    totalFeedKg: {
      name: "TotalFeedKg",
      type: "numeric",
    },
    feedRate: {
      name: "FeedRate",
      type: "numeric",
    },
    feedCost: {
      name: "FeedCost",
      type: "numeric",
    },
    totalSoldBirds: {
      name: "TotalSoldBirds",
      type: "int",
    },
    totalBirdsWeight: {
      name: "TotalBirdsWeight",
      type: "numeric",
    },
    avgBodyWeight: {
      name: "AvgBodyWeight",
      type: "numeric",
    },
    chicksCost: {
      name: "ChicksCost",
      type: "numeric",
    },
    medicineCost: {
      name: "MedicineCost",
      type: "numeric",
    },
    adminCost: {
      name: "AdminCost",
      type: "numeric",
    },
    grossProductionCost: {
      name: "GrossProductionCost",
      type: "numeric",
    },
    netCostPerKg: {
      name: "NetCostPerKg",
      type: "numeric",
    },
    stdCostPerKg: {
      name: "StdCostPerKg",
      type: "numeric",
    },
    rearingChargesStd: {
      name: "RearingChargesStd",
      type: "numeric",
    },
    productionCostIncentive: {
      name: "ProductionCostIncentive",
      type: "numeric",
    },
    rearingChargesPerBird: {
      name: "RearingChargesPerBird",
      type: "numeric",
    },
    totalRearingCharges: {
      name: "TotalRearingCharges",
      type: "numeric",
    },
    totalAmountPayable: {
      name: "TotalAmountPayable",
      type: "numeric",
    },
    isDeleted: {
      name: "IsDeleted",
      type: "boolean",
      default: false,
    },
  },
  relations: {
    batch: {
      type: "one-to-one",
      target: "Batch",
      joinColumn: { name: "BatchId" },
      onDelete: "RESTRICT",
    },
  },
});

export default FinalReportEntity;
