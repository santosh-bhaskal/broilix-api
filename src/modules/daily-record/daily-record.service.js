import { AppDataSource } from "../../core/database/dbConnect.js";
import { BATCH_STATUS } from "../../core/constants/constants.js";
import { normalizeToUtc } from "../../core/utils/dateHelper.js";
import ApiError from "../../core/utils/ApiError.js";

const getDailyRepo = () => AppDataSource.getRepository("DailyRecord");
const getBatchRepo = () => AppDataSource.getRepository("Batch");
const getFeedRepo = () => AppDataSource.getRepository("FeedInventory");
const getBirdRepo = () => AppDataSource.getRepository("BirdInventory");

export const getAllDailyRecords = async () => {
  const batchRepo = getBatchRepo();
  const activeBatch = await batchRepo.findOne({
    where: { status: BATCH_STATUS.ONGOING, isDeleted: false },
    order: { id: "DESC" },
  });

  if (!activeBatch) {
    return {
      Message: "Daily records fetched successfully",
      Data: [],
      message: "Daily records fetched successfully",
      data: [],
    };
  }

  const dailyRepo = getDailyRepo();
  const records = await dailyRepo.find({
    where: { batchId: activeBatch.id, isDeleted: false },
    order: { date: "DESC", id: "DESC" },
  });

  return {
    Message: "Daily records fetched successfully",
    Data: records,
    message: "Daily records fetched successfully",
    data: records,
  };
};

export const getDailyRecordsByBatch = async (batchIdParam) => {
  const batchId = parseInt(batchIdParam, 10);
  if (!batchId || isNaN(batchId)) {
    throw ApiError.badRequest("Invalid batch ID");
  }

  const dailyRepo = getDailyRepo();
  const records = await dailyRepo.find({
    where: { batchId, isDeleted: false },
    order: { date: "DESC", id: "DESC" },
  });

  return {
    Message: "Daily records fetched successfully",
    Data: records,
    message: "Daily records fetched successfully",
    data: records,
  };
};

export const createDailyRecord = async (body) => {
  const batchRepo = getBatchRepo();
  const activeBatch = await batchRepo.findOne({
    where: { status: BATCH_STATUS.ONGOING, isDeleted: false },
    order: { id: "DESC" },
  });

  if (!activeBatch) {
    throw ApiError.badRequest("No active batch found.");
  }

  const batchId = activeBatch.id;
  const date = normalizeToUtc(body.date ?? body.Date);
  const birdAgeInDays = body.birdAgeInDays ?? body.BirdAgeInDays ?? 0;
  const feedConsumedBags = body.feedConsumedBags ?? body.FeedConsumedBags ?? 0;
  const mortalityCount = body.mortalityCount ?? body.MortalityCount ?? 0;

  // Calculate feed balance
  const feedRepo = getFeedRepo();
  const feedInventories = await feedRepo.find({
    where: { batchId, isDeleted: false },
  });
  const feedBalance = feedInventories.reduce((acc, curr) => acc + (curr.bagsArrivedCount || 0), 0);

  // Calculate bird balance
  const birdRepo = getBirdRepo();
  const birdInventories = await birdRepo.find({
    where: { batchId, isDeleted: false },
  });
  const birdBalance = birdInventories.reduce((acc, curr) => acc + (curr.housedBirdCount || 0), 0);

  if (feedBalance < feedConsumedBags) {
    return {
      status: 400,
      body: {
        Message: "Not enough feed bags available.",
        FeedBalance: feedBalance,
        feedBalance,
      },
    };
  }

  if (birdBalance < mortalityCount) {
    return {
      status: 400,
      body: {
        Message: "Mortality count can't be greater than ttotal birds.",
        birdBalance,
        BirdBalance: birdBalance,
      },
    };
  }

  const dailyRepo = getDailyRepo();
  const record = dailyRepo.create({
    batchId,
    date,
    birdAgeInDays,
    feedConsumedBags,
    mortalityCount,
    isDeleted: false,
  });

  await dailyRepo.save(record);

  return {
    status: 200,
    body: {
      Message: "Daily record added successfully.",
      message: "Daily record added successfully.",
      Record: record,
      record,
    },
  };
};

export const updateDailyRecord = async (idParam, body) => {
  const id = parseInt(idParam, 10);
  if (!id || id <= 0) {
    throw ApiError.badRequest("Invalid ID");
  }

  const dailyRepo = getDailyRepo();
  const existing = await dailyRepo.findOne({
    where: { id, isDeleted: false },
  });

  if (!existing) {
    throw ApiError.notFound("Record not found or already deleted.");
  }

  existing.date = normalizeToUtc(body.date ?? body.Date);
  if (body.birdAgeInDays !== undefined || body.BirdAgeInDays !== undefined) {
    existing.birdAgeInDays = body.birdAgeInDays ?? body.BirdAgeInDays;
  }
  if (body.feedConsumedBags !== undefined || body.FeedConsumedBags !== undefined) {
    existing.feedConsumedBags = body.feedConsumedBags ?? body.FeedConsumedBags;
  }
  if (body.mortalityCount !== undefined || body.MortalityCount !== undefined) {
    existing.mortalityCount = body.mortalityCount ?? body.MortalityCount;
  }

  await dailyRepo.save(existing);

  return {
    Message: "Record updated successfully.",
    message: "Record updated successfully.",
  };
};

export const softDeleteDailyRecord = async (idParam) => {
  const id = parseInt(idParam, 10);
  if (!id || id <= 0) {
    throw ApiError.badRequest("Invalid ID");
  }

  const dailyRepo = getDailyRepo();
  const result = await dailyRepo.update({ id, isDeleted: false }, { isDeleted: true });

  if (result.affected === 0) {
    throw ApiError.notFound("Record not found or already deleted.");
  }

  return {
    Message: "Record soft-deleted successfully.",
    UpdatedRecords: result.affected,
    message: "Record soft-deleted successfully.",
    updatedRecords: result.affected,
  };
};

export const deleteDailyRecord = async (idParam) => {
  const id = parseInt(idParam, 10);
  if (!id || id <= 0) {
    throw ApiError.badRequest("Invalid ID");
  }

  const dailyRepo = getDailyRepo();
  const result = await dailyRepo.delete(id);

  if (result.affected === 0) {
    throw ApiError.notFound("Record not found.");
  }

  return {
    Message: "Record permanently deleted successfully.",
    DeletedRecords: result.affected,
    message: "Record permanently deleted successfully.",
    deletedRecords: result.affected,
  };
};

export default {
  getAllDailyRecords,
  getDailyRecordsByBatch,
  createDailyRecord,
  updateDailyRecord,
  softDeleteDailyRecord,
  deleteDailyRecord,
};
