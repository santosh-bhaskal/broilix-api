import { AppDataSource } from "../../core/database/dbConnect.js";
import { BATCH_STATUS } from "../../core/constants/constants.js";
import ApiError from "../../core/utils/ApiError.js";

const getBatchRepo = () => AppDataSource.getRepository("Batch");

export const createBatch = async (body) => {
  const batchRepo = getBatchRepo();
  const exists = await batchRepo.findOne({
    where: { status: BATCH_STATUS.ONGOING, isDeleted: false },
  });

  if (exists) {
    throw ApiError.badRequest("Another batch is already active. Close it before adding a new batch.");
  }

  const batchNo = body.batchNo ?? body.BatchNo ?? 1;
  const userId = body.userId ?? body.UserId ?? null;

  const newBatch = batchRepo.create({
    batchNo,
    startDate: new Date(),
    status: BATCH_STATUS.ONGOING,
    isDeleted: false,
    userId,
  });

  await batchRepo.save(newBatch);

  return {
    message: "Batch created",
    Message: "Batch created",
    data: newBatch,
    Data: newBatch,
  };
};

export const getActiveBatch = async () => {
  const batchRepo = getBatchRepo();
  const batch = await batchRepo.findOne({
    where: { status: BATCH_STATUS.ONGOING, isDeleted: false },
    order: { id: "DESC" },
  });

  if (!batch) {
    throw ApiError.notFound("No active batch found.");
  }

  return batch;
};

export const closeBatch = async (batchId) => {
  const id = parseInt(batchId, 10);
  if (!id || isNaN(id)) {
    throw ApiError.badRequest("Invalid batch ID.");
  }

  const batchRepo = getBatchRepo();
  const batch = await batchRepo.findOne({
    where: { id },
  });

  if (!batch) {
    throw ApiError.notFound("Batch not found.");
  }

  if (batch.status === BATCH_STATUS.COMPLETED) {
    throw ApiError.badRequest("This batch is already closed.");
  }

  batch.status = BATCH_STATUS.COMPLETED;
  batch.endDate = new Date();

  await batchRepo.save(batch);

  return "Batch closed successfully.";
};

export const getAllBatches = async () => {
  const batchRepo = getBatchRepo();
  const batches = await batchRepo.find({
    where: { isDeleted: false },
    relations: ["birdInventory", "feedInventories", "dailyRecords"],
    order: { id: "DESC" },
  });

  return batches;
};

export default {
  createBatch,
  getActiveBatch,
  closeBatch,
  getAllBatches,
};
