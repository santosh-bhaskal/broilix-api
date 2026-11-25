import { AppDataSource } from "../../core/database/dbConnect.js";
import { BATCH_STATUS } from "../../core/constants/constants.js";
import { normalizeToUtc } from "../../core/utils/dateHelper.js";
import ApiError from "../../core/utils/ApiError.js";
import { In, IsNull } from "typeorm";

const getReportRepo = () => AppDataSource.getRepository("FinalReport");
const getBatchRepo = () => AppDataSource.getRepository("Batch");

export const getAllReports = async (userId = null) => {
  const reportRepo = getReportRepo();
  const batchRepo = getBatchRepo();
  let reports = [];
  if (userId) {
    const userBatches = await batchRepo.find({
      where: [{ userId, isDeleted: false }, { isDeleted: false, userId: IsNull() }],
    });
    const batchIds = userBatches.map((b) => b.id);
    if (batchIds.length > 0) {
      reports = await reportRepo.find({
        where: { batchId: In(batchIds), isDeleted: false },
        order: { startDate: "DESC", id: "DESC" },
      });
    }
  } else {
    reports = await reportRepo.find({
      where: { isDeleted: false },
      order: { startDate: "DESC", id: "DESC" },
    });
  }

  return {
    message: "Final reports fetched successfully",
    data: reports,
  };
};

export const getPrepareData = async (userId = null, batchIdParam = null) => {
  const batchRepo = getBatchRepo();
  let activeBatch = null;

  if (batchIdParam) {
    activeBatch = await batchRepo.findOne({
      where: { id: Number(batchIdParam), isDeleted: false },
    });
    if (!activeBatch) {
      activeBatch = await batchRepo.findOne({
        where: { batchNo: Number(batchIdParam), isDeleted: false },
        order: { id: "DESC" },
      });
    }
  }

  if (!activeBatch && userId) {
    activeBatch = await batchRepo.findOne({
      where: { userId, status: BATCH_STATUS.ONGOING, isDeleted: false },
      order: { id: "DESC" },
    });
  }
  if (!activeBatch) {
    activeBatch = await batchRepo.findOne({
      where: { status: BATCH_STATUS.ONGOING, isDeleted: false },
      order: { id: "DESC" },
    });
  }

  // Fallback: If no ONGOING batch, retrieve the most recent active batch
  if (!activeBatch) {
    if (userId) {
      activeBatch = await batchRepo.findOne({
        where: [{ userId, isDeleted: false }, { isDeleted: false, userId: IsNull() }],
        order: { id: "DESC" },
      });
    } else {
      activeBatch = await batchRepo.findOne({
        where: { isDeleted: false },
        order: { id: "DESC" },
      });
    }
  }

  if (!activeBatch) {
    throw ApiError.notFound("No batch found.");
  }

  const batchId = activeBatch.id;

  // Bird Inventory
  const birdRepo = AppDataSource.getRepository("BirdInventory");
  const birdInventory = await birdRepo.findOne({
    where: [{ batchId, isDeleted: false }, { batchId, isDeleted: IsNull() }],
    order: { id: "DESC" },
  });

  // Stock Out Masters with entries (from checkout)
  const stockOutRepo = AppDataSource.getRepository("StockOutMaster");
  const stockOuts = await stockOutRepo.find({
    where: [{ batchId, isDeleted: false }, { batchId, isDeleted: IsNull() }],
    relations: { entries: true },
  });

  const masterIds = stockOuts.map((s) => s.id);
  let allEntries = [];
  if (masterIds.length > 0) {
    const entryRepo = AppDataSource.getRepository("StockOutEntry");
    allEntries = await entryRepo.find({
      where: { stockOutMasterId: In(masterIds) },
    });
  }

  // Calculate sold birds & checkout weights directly
  const entriesSoldBirds = allEntries.reduce((sum, e) => sum + (Number(e.birds) || 0), 0);
  const entriesWeight = allEntries.reduce((sum, e) => sum + (Number(e.weight) || 0), 0);

  const mastersSoldBirds = stockOuts.reduce((sum, s) => sum + (Number(s.totalBirds) || 0), 0);
  const mastersWeight = stockOuts.reduce((sum, s) => sum + (Number(s.totalWeight) || 0), 0);

  const totalSoldBirds = entriesSoldBirds > 0 ? entriesSoldBirds : mastersSoldBirds;
  const totalExportedWeight = entriesWeight > 0
    ? Number(entriesWeight.toFixed(2))
    : Number(mastersWeight.toFixed(2));

  // Feed Inventory
  const feedRepo = AppDataSource.getRepository("FeedInventory");
  const feedInventories = await feedRepo.find({
    where: [{ batchId, isDeleted: false }, { batchId, isDeleted: IsNull() }],
  });

  const totalFeedBags = feedInventories.reduce((sum, f) => sum + (Number(f.bagsArrivedCount) || 0), 0);

  const prepareData = {
    id: activeBatch.id,
    batchNo: activeBatch.batchNo,
    startDate: birdInventory?.date || activeBatch.startDate,
    totalHousedBirds: Number(birdInventory?.housedBirdCount || birdInventory?.totalBirdCount || birdInventory?.birdsArrivedCount) || 0,
    totalSoldBirds,
    totalExportedWeight,
    totalFeedBags,
  };

  return {
    message: "Final report prepare data fetched successfully",
    data: prepareData,
  };
};

export const getReportById = async (idParam) => {
  const id = parseInt(idParam, 10);
  if (!id || isNaN(id)) {
    throw ApiError.badRequest("Invalid ID");
  }

  const reportRepo = getReportRepo();
  const report = await reportRepo.findOne({
    where: { id, isDeleted: false },
  });

  return {
    message: "Final reports fetched successfully",
    data: report,
  };
};

export const createReport = async (body, userId = null) => {
  const batchRepo = getBatchRepo();
  let activeBatch = null;

  const requestedBatchId = body.batchId ?? body.BatchId;
  if (requestedBatchId) {
    activeBatch = await batchRepo.findOne({
      where: { id: Number(requestedBatchId), isDeleted: false },
    });
    if (!activeBatch) {
      activeBatch = await batchRepo.findOne({
        where: { batchNo: Number(requestedBatchId), isDeleted: false },
        order: { id: "DESC" },
      });
    }
  }

  if (!activeBatch && userId) {
    activeBatch = await batchRepo.findOne({
      where: { userId, status: BATCH_STATUS.ONGOING, isDeleted: false },
      order: { id: "DESC" },
    });
  }
  if (!activeBatch) {
    activeBatch = await batchRepo.findOne({
      where: { status: BATCH_STATUS.ONGOING, isDeleted: false },
      order: { id: "DESC" },
    });
  }

  if (!activeBatch) {
    throw ApiError.badRequest("No batch found to settle.");
  }

  const batchId = activeBatch.id;
  const reportRepo = getReportRepo();

  const record = reportRepo.create({
    batchId,
    startDate: normalizeToUtc(body.startDate ?? body.StartDate ?? activeBatch.startDate),
    endDate: normalizeToUtc(body.endDate ?? body.EndDate ?? new Date()),
    totalBirds: body.totalBirds ?? body.TotalBirds ?? 0,
    birdRate: body.birdRate ?? body.BirdRate ?? 0,
    birdCost: body.birdCost ?? body.BirdCost ?? 0,
    totalBags: body.totalBags ?? body.TotalBags ?? 0,
    totalFeedKg: body.totalFeedKg ?? body.TotalFeedKg ?? 0,
    feedRate: body.feedRate ?? body.FeedRate ?? 0,
    feedCost: body.feedCost ?? body.FeedCost ?? 0,
    totalSoldBirds: body.totalSoldBirds ?? body.TotalSoldBirds ?? 0,
    totalBirdsWeight: body.totalBirdsWeight ?? body.TotalBirdsWeight ?? 0,
    avgBodyWeight: body.avgBodyWeight ?? body.AvgBodyWeight ?? 0,
    chicksCost: body.chicksCost ?? body.ChicksCost ?? 0,
    medicineCost: body.medicineCost ?? body.MedicineCost ?? 0,
    adminCost: body.adminCost ?? body.AdminCost ?? 0,
    grossProductionCost: body.grossProductionCost ?? body.GrossProductionCost ?? 0,
    netCostPerKg: body.netCostPerKg ?? body.NetCostPerKg ?? 0,
    stdCostPerKg: body.stdCostPerKg ?? body.StdCostPerKg ?? 0,
    rearingChargesStd: body.rearingChargesStd ?? body.RearingChargesStd ?? 0,
    productionCostIncentive: body.productionCostIncentive ?? body.ProductionCostIncentive ?? 0,
    rearingChargesPerBird: body.rearingChargesPerBird ?? body.RearingChargesPerBird ?? 0,
    totalRearingCharges: body.totalRearingCharges ?? body.TotalRearingCharges ?? 0,
    totalAmountPayable: body.totalAmountPayable ?? body.TotalAmountPayable ?? 0,
    isDeleted: false,
  });

  await reportRepo.save(record);

  // Mark the batch as COMPLETED
  activeBatch.status = BATCH_STATUS.COMPLETED;
  activeBatch.endDate = record.endDate || new Date();
  await batchRepo.save(activeBatch);

  return {
    message: "Final report created successfully and batch marked as completed.",
    data: record,
  };
};

export const updateReport = async (idParam, body) => {
  const id = parseInt(idParam, 10);
  if (!id || id <= 0) {
    throw ApiError.badRequest("Invalid ID");
  }

  const reportRepo = getReportRepo();
  const existing = await reportRepo.findOne({
    where: { id, isDeleted: false },
  });

  if (!existing) {
    throw ApiError.notFound("Record not found.");
  }

  if (body.startDate !== undefined || body.StartDate !== undefined) {
    existing.startDate = normalizeToUtc(body.startDate ?? body.StartDate);
  }
  if (body.endDate !== undefined || body.EndDate !== undefined) {
    existing.endDate = normalizeToUtc(body.endDate ?? body.EndDate);
  }
  if (body.totalBirds !== undefined || body.TotalBirds !== undefined) {
    existing.totalBirds = body.totalBirds ?? body.TotalBirds;
  }
  if (body.birdRate !== undefined || body.BirdRate !== undefined) {
    existing.birdRate = body.birdRate ?? body.BirdRate;
  }
  if (body.birdCost !== undefined || body.BirdCost !== undefined) {
    existing.birdCost = body.birdCost ?? body.BirdCost;
  }
  if (body.totalBags !== undefined || body.TotalBags !== undefined) {
    existing.totalBags = body.totalBags ?? body.TotalBags;
  }
  if (body.totalFeedKg !== undefined || body.TotalFeedKg !== undefined) {
    existing.totalFeedKg = body.totalFeedKg ?? body.TotalFeedKg;
  }
  if (body.feedRate !== undefined || body.FeedRate !== undefined) {
    existing.feedRate = body.feedRate ?? body.FeedRate;
  }
  if (body.feedCost !== undefined || body.FeedCost !== undefined) {
    existing.feedCost = body.feedCost ?? body.FeedCost;
  }
  if (body.totalSoldBirds !== undefined || body.TotalSoldBirds !== undefined) {
    existing.totalSoldBirds = body.totalSoldBirds ?? body.TotalSoldBirds;
  }
  if (body.totalBirdsWeight !== undefined || body.TotalBirdsWeight !== undefined) {
    existing.totalBirdsWeight = body.totalBirdsWeight ?? body.TotalBirdsWeight;
  }
  if (body.avgBodyWeight !== undefined || body.AvgBodyWeight !== undefined) {
    existing.avgBodyWeight = body.avgBodyWeight ?? body.AvgBodyWeight;
  }
  if (body.chicksCost !== undefined || body.ChicksCost !== undefined) {
    existing.chicksCost = body.chicksCost ?? body.ChicksCost;
  }
  if (body.medicineCost !== undefined || body.MedicineCost !== undefined) {
    existing.medicineCost = body.medicineCost ?? body.MedicineCost;
  }
  if (body.adminCost !== undefined || body.AdminCost !== undefined) {
    existing.adminCost = body.adminCost ?? body.AdminCost;
  }
  if (body.grossProductionCost !== undefined || body.GrossProductionCost !== undefined) {
    existing.grossProductionCost = body.grossProductionCost ?? body.GrossProductionCost;
  }
  if (body.netCostPerKg !== undefined || body.NetCostPerKg !== undefined) {
    existing.netCostPerKg = body.netCostPerKg ?? body.NetCostPerKg;
  }
  if (body.stdCostPerKg !== undefined || body.StdCostPerKg !== undefined) {
    existing.stdCostPerKg = body.stdCostPerKg ?? body.StdCostPerKg;
  }
  if (body.rearingChargesStd !== undefined || body.RearingChargesStd !== undefined) {
    existing.rearingChargesStd = body.rearingChargesStd ?? body.RearingChargesStd;
  }
  if (body.productionCostIncentive !== undefined || body.ProductionCostIncentive !== undefined) {
    existing.productionCostIncentive = body.productionCostIncentive ?? body.ProductionCostIncentive;
  }
  if (body.rearingChargesPerBird !== undefined || body.RearingChargesPerBird !== undefined) {
    existing.rearingChargesPerBird = body.rearingChargesPerBird ?? body.RearingChargesPerBird;
  }
  if (body.totalRearingCharges !== undefined || body.TotalRearingCharges !== undefined) {
    existing.totalRearingCharges = body.totalRearingCharges ?? body.TotalRearingCharges;
  }
  if (body.totalAmountPayable !== undefined || body.TotalAmountPayable !== undefined) {
    existing.totalAmountPayable = body.totalAmountPayable ?? body.TotalAmountPayable;
  }

  await reportRepo.save(existing);

  return {
    message: "Final report updated successfully.",
  };
};

export const softDeleteReport = async (idParam) => {
  const id = parseInt(idParam, 10);
  if (!id || id <= 0) {
    throw ApiError.badRequest("Invalid ID");
  }

  const reportRepo = getReportRepo();
  const result = await reportRepo.update({ id, isDeleted: false }, { isDeleted: true });

  if (result.affected === 0) {
    throw ApiError.notFound("Record not found or already deleted.");
  }

  return {
    message: "Record soft deleted successfully.",
  };
};

export const deleteReport = async (idParam) => {
  const id = parseInt(idParam, 10);
  if (!id || id <= 0) {
    throw ApiError.badRequest("Invalid ID");
  }

  const reportRepo = getReportRepo();
  const result = await reportRepo.delete(id);

  if (result.affected === 0) {
    throw ApiError.notFound("Record not found.");
  }

  return {
    message: "Record permanently deleted successfully.",
    deletedRecords: result.affected,
  };
};

export default {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  softDeleteReport,
  deleteReport,
};
