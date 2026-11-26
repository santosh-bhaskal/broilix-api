import { AppDataSource } from "../../core/database/dbConnect.js";
import { BATCH_STATUS } from "../../core/constants/constants.js";
import ApiError from "../../core/utils/ApiError.js";
import { sendToUser } from "../notifications/notification.service.js";

const getMasterRepo = () => AppDataSource.getRepository("StockOutMaster");
const getEntryRepo = () => AppDataSource.getRepository("StockOutEntry");
const getBatchRepo = () => AppDataSource.getRepository("Batch");

// ----------------- Master Services -----------------

export const getAllMasters = async (userId = null) => {
  const batchRepo = getBatchRepo();
  let activeBatch = null;
  if (userId) {
    activeBatch = await batchRepo.findOne({
      where: { userId, status: BATCH_STATUS.ONGOING, isDeleted: false },
      order: { id: "DESC" },
    });
  }

  if (!activeBatch) {
    return {
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
    relations: { entries: true },
  });

  return {
    message: "Stock Out masters fetched successfully",
    data: record,
  };
};

export const createMaster = async (userId = null, body = {}) => {
  const batchRepo = getBatchRepo();
  let activeBatch = null;
  if (userId) {
    activeBatch = await batchRepo.findOne({
      where: { userId, status: BATCH_STATUS.ONGOING, isDeleted: false },
      order: { id: "DESC" },
    });
  }

  if (!activeBatch) {
    throw ApiError.badRequest("No active batch found.");
  }

  const masterRepo = getMasterRepo();
  const latestMaster = await masterRepo.findOne({
    where: { batchId: activeBatch.id },
    order: { stockOutNo: "DESC" },
  });

  const nextStockOutNo = (latestMaster?.stockOutNo || 0) + 1;

  const rawDate = body?.date || body?.Date;
  const parsedDate = rawDate ? new Date(rawDate) : new Date();

  const master = masterRepo.create({
    date: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
    batchId: activeBatch.id,
    stockOutNo: nextStockOutNo,
    status: 0,
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

  if (body.date || body.Date) {
    const rawDate = body.date || body.Date;
    const parsedDate = new Date(rawDate);
    if (!isNaN(parsedDate.getTime())) {
      master.date = parsedDate;
    }
  }

  master.status = 1;
  master.totalBirds = body.totalBirds ?? body.TotalBirds ?? master.totalBirds;
  master.totalWeight = body.totalWeight ?? body.TotalWeight ?? master.totalWeight;
  master.avgWeight = body.avgWeight ?? body.AvgWeight ?? master.avgWeight;

  await masterRepo.save(master);

  const batch = await getBatchRepo().findOne({ where: { id: master.batchId } });
  if (batch?.userId) {
    void sendToUser(batch.userId, {
      title: `Dispatch #${master.stockOutNo} Finalized`,
      body: `${master.totalBirds} birds · ${master.totalWeight} kg total weight`,
      data: { type: "stockout", masterId: master.id, batchId: master.batchId },
    }).catch(() => {});
  }

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

export const softDeleteMaster = async (idParam) => {
  const id = parseInt(idParam, 10);
  if (!id || isNaN(id)) {
    throw ApiError.badRequest("Invalid Stock Out Master ID");
  }

  const masterRepo = getMasterRepo();
  const result = await masterRepo.update({ id, isDeleted: false }, { isDeleted: true });
  if (!result.affected) {
    throw ApiError.notFound("Stock Out record not found or already deleted");
  }

  return {
    message: "Stock Out record soft-deleted successfully",
    updatedRecords: result.affected,
  };
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
  softDeleteMaster,
};
