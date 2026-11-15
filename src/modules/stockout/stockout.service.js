import { AppDataSource } from "../../core/database/dbConnect.js";
import { BATCH_STATUS } from "../../core/constants/constants.js";
import ApiError from "../../core/utils/ApiError.js";

const getMasterRepo = () => AppDataSource.getRepository("StockOutMaster");
const getEntryRepo = () => AppDataSource.getRepository("StockOutEntry");
const getBatchRepo = () => AppDataSource.getRepository("Batch");

// ----------------- Master Services -----------------

export const getAllMasters = async () => {
  const batchRepo = getBatchRepo();
  const activeBatch = await batchRepo.findOne({
    where: { status: BATCH_STATUS.ONGOING, isDeleted: false },
    order: { id: "DESC" },
  });

  if (!activeBatch) {
    return {
      Message: "No active batch found.",
      Data: [],
      message: "No active batch found.",
      data: [],
    };
  }

  const masterRepo = getMasterRepo();
  const records = await masterRepo.find({
    where: { batchId: activeBatch.id, isDeleted: false },
    order: { id: "DESC" },
  });

  return {
    Message: "Stock Out masters fetched successfully",
    Data: records,
    message: "Stock Out masters fetched successfully",
    data: records,
  };
};

export const getMasterById = async (masterIdParam) => {
  const masterId = parseInt(masterIdParam, 10);
  if (!masterId || isNaN(masterId)) {
    throw ApiError.badRequest("Invalid master ID");
  }

  const masterRepo = getMasterRepo();
  const record = await masterRepo.findOne({
    where: { id: masterId, isDeleted: false },
    relations: ["entries"],
  });

  return {
    Message: "Stock Out masters fetched successfully",
    Data: record,
    message: "Stock Out masters fetched successfully",
    data: record,
  };
};

export const createMaster = async () => {
  const batchRepo = getBatchRepo();
  const activeBatch = await batchRepo.findOne({
    where: { status: BATCH_STATUS.ONGOING, isDeleted: false },
    order: { id: "DESC" },
  });

  if (!activeBatch) {
    throw ApiError.badRequest("No active batch found.");
  }

  const masterRepo = getMasterRepo();
  const latestMaster = await masterRepo.findOne({
    where: { batchId: activeBatch.id },
    order: { stockOutNo: "DESC" },
  });

  const nextStockOutNo = (latestMaster?.stockOutNo || 0) + 1;

  const master = masterRepo.create({
    date: new Date(),
    batchId: activeBatch.id,
    stockOutNo: nextStockOutNo,
    totalBirds: 0,
    totalWeight: 0,
    avgWeight: 0,
    isDeleted: false,
  });

  await masterRepo.save(master);

  return {
    message: "Master created!",
    masterId: master.id,
    stockOutNo: master.stockOutNo,
  };
};

export const finalizeMaster = async (idParam, body) => {
  const id = parseInt(idParam, 10);
  if (!id || isNaN(id)) {
    throw ApiError.badRequest("Invalid master ID");
  }

  const masterRepo = getMasterRepo();
  const master = await masterRepo.findOne({
    where: { id },
  });

  if (!master) {
    throw ApiError.notFound("Master record not found.");
  }

  master.totalBirds = body.totalBirds ?? body.TotalBirds ?? master.totalBirds;
  master.totalWeight = body.totalWeight ?? body.TotalWeight ?? master.totalWeight;
  master.avgWeight = body.avgWeight ?? body.AvgWeight ?? master.avgWeight;

  await masterRepo.save(master);

  return "Master finalized!";
};

// ----------------- Entry Services -----------------

export const addEntry = async (body) => {
  const masterId = body.stockOutMasterId ?? body.StockOutMasterId;
  const birds = body.birds ?? body.Birds ?? 0;
  const weight = body.weight ?? body.Weight ?? 0;

  if (!masterId) {
    throw ApiError.badRequest("stockOutMasterId is required");
  }

  const entryRepo = getEntryRepo();
  const lastEntry = await entryRepo.findOne({
    where: { stockOutMasterId: masterId },
    order: { srNo: "DESC" },
  });

  const nextSrNo = (lastEntry?.srNo || 0) + 1;

  const entry = entryRepo.create({
    stockOutMasterId: masterId,
    birds,
    weight,
    srNo: nextSrNo,
  });

  await entryRepo.save(entry);

  return {
    message: "Entry added!",
    entry,
  };
};

export const getEntriesByMaster = async (masterIdParam) => {
  const masterId = parseInt(masterIdParam, 10);
  if (!masterId || isNaN(masterId)) {
    throw ApiError.badRequest("Invalid master ID");
  }

  const entryRepo = getEntryRepo();
  const entries = await entryRepo.find({
    where: { stockOutMasterId: masterId },
    order: { srNo: "ASC" },
  });

  return {
    message: "Previous Entries Fetched Successfully",
    entries,
  };
};

export const editEntry = async (idParam, body) => {
  const id = parseInt(idParam, 10);
  if (!id || isNaN(id)) {
    throw ApiError.badRequest("Invalid entry ID");
  }

  const entryRepo = getEntryRepo();
  const entry = await entryRepo.findOne({
    where: { id },
  });

  if (!entry) {
    throw ApiError.notFound("Entry not found");
  }

  if (body.srNo !== undefined || body.SrNo !== undefined) {
    entry.srNo = body.srNo ?? body.SrNo;
  }
  if (body.birds !== undefined || body.Birds !== undefined) {
    entry.birds = body.birds ?? body.Birds;
  }
  if (body.weight !== undefined || body.Weight !== undefined) {
    entry.weight = body.weight ?? body.Weight;
  }

  await entryRepo.save(entry);

  return {
    message: "Entry updated successfully",
    updatedEntry: entry,
  };
};

export const deleteEntry = async (idParam) => {
  const id = parseInt(idParam, 10);
  if (!id || isNaN(id)) {
    throw ApiError.badRequest("Invalid entry ID");
  }

  const entryRepo = getEntryRepo();
  const entry = await entryRepo.findOne({
    where: { id },
  });

  if (!entry) {
    throw ApiError.notFound("Entry not found");
  }

  await entryRepo.remove(entry);

  return "Entry deleted!";
};

export default {
  getAllMasters,
  getMasterById,
  createMaster,
  finalizeMaster,
  addEntry,
  getEntriesByMaster,
  editEntry,
  deleteEntry,
};
