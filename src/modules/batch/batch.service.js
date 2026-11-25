import { AppDataSource } from "../../core/database/dbConnect.js";
import { BATCH_STATUS } from "../../core/constants/constants.js";
import ApiError from "../../core/utils/ApiError.js";
import { IsNull } from "typeorm";

const getBatchRepo = () => AppDataSource.getRepository("Batch");

export const createBatch = async (body, userId = null) => {
  const batchRepo = getBatchRepo();
  const resolvedUserId = userId ?? body.userId ?? body.UserId ?? null;

  // Check if an ongoing batch exists for this user (or globally if no userId)
  const where = resolvedUserId
    ? { status: BATCH_STATUS.ONGOING, isDeleted: false, userId: resolvedUserId }
    : { status: BATCH_STATUS.ONGOING, isDeleted: false };

  const exists = await batchRepo.findOne({ where });

  if (exists) {
    throw ApiError.badRequest("Another batch is already active. Close it before adding a new batch.");
  }

  // Auto-generate next batchNo if not passed
  let batchNo = body.batchNo ?? body.BatchNo;
  if (!batchNo || isNaN(Number(batchNo))) {
    const lastBatchWhere = resolvedUserId
      ? [{ userId: resolvedUserId }, { userId: IsNull() }]
      : {};
    const lastBatch = await batchRepo.findOne({
      where: lastBatchWhere,
      order: { id: "DESC" },
    });
    batchNo = lastBatch?.batchNo ? Number(lastBatch.batchNo) + 1 : 1;
  } else {
    batchNo = Number(batchNo);
  }

  const newBatch = batchRepo.create({
    batchNo,
    startDate: new Date(),
    status: BATCH_STATUS.ONGOING,
    isDeleted: false,
    userId: resolvedUserId,
  });

  await batchRepo.save(newBatch);

  return {
    message: "Batch created",
    data: newBatch,
  };
};

export const getActiveBatch = async (userId = null) => {
  const batchRepo = getBatchRepo();

  // Try to find user's active batch first
  if (userId) {
    const userBatch = await batchRepo.findOne({
      where: { userId, status: BATCH_STATUS.ONGOING, isDeleted: false },
      order: { id: "DESC" },
    });
    if (userBatch) return userBatch;
  }

  // Fallback to active batch where userId is null
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

export const getAllBatches = async (userId = null) => {
  const batchRepo = getBatchRepo();
  const where = userId
    ? [{ userId, isDeleted: false }, { isDeleted: false, userId: IsNull() }]
    : { isDeleted: false };
  const batches = await batchRepo.find({
    where,
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
