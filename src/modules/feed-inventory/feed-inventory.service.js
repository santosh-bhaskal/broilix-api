import { AppDataSource } from "../../core/database/dbConnect.js";
import { BATCH_STATUS } from "../../core/constants/constants.js";
import { normalizeToUtc } from "../../core/utils/dateHelper.js";
import ApiError from "../../core/utils/ApiError.js";

const getFeedRepo = () => AppDataSource.getRepository("FeedInventory");
const getBatchRepo = () => AppDataSource.getRepository("Batch");

export const getAllFeedInventories = async (userId = null) => {
  const batchRepo = getBatchRepo();
  let activeBatch = null;
  if (userId) {
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
    return {
      message: "Feed inventories fetched successfully",
      data: [],
    };
  }

  const feedRepo = getFeedRepo();
  const inventory = await feedRepo.find({
    where: { batchId: activeBatch.id, isDeleted: false },
    order: { date: "DESC", id: "DESC" },
  });

  return {
    message: "Feed inventories fetched successfully",
    data: inventory,
  };
};

export const createFeedInventory = async (body, userId = null) => {
  const batchRepo = getBatchRepo();
  let activeBatch = null;
  if (userId) {
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
    throw ApiError.badRequest("No active batch found.");
  }

  const date = normalizeToUtc(body.date ?? body.Date);
  const feedName = body.feedName ?? body.FeedName ?? "";
  const bagsArrivedCount = body.bagsArrivedCount ?? body.BagsArrivedCount ?? 0;
  const driverName = body.driverName ?? body.DriverName ?? "";
  const driverPhoneNumber = body.driverPhoneNumber ?? body.DriverPhoneNumber ?? "";

  const feedRepo = getFeedRepo();
  const record = feedRepo.create({
    batchId: activeBatch.id,
    date,
    feedName,
    bagsArrivedCount,
    driverName,
    driverPhoneNumber,
    isDeleted: false,
  });

  await feedRepo.save(record);

  return {
    message: "Feed inventory record added successfully.",
    data: record,
  };
};

export const updateFeedInventory = async (idParam, body) => {
  const id = parseInt(idParam, 10);
  if (!id || id <= 0) {
    throw ApiError.badRequest("Invalid ID");
  }

  const feedRepo = getFeedRepo();
  const existing = await feedRepo.findOne({
    where: { id, isDeleted: false },
  });

  if (!existing) {
    throw ApiError.notFound("Record not found or already deleted.");
  }

  existing.date = normalizeToUtc(body.date ?? body.Date);
  if (body.feedName !== undefined || body.FeedName !== undefined) {
    existing.feedName = body.feedName ?? body.FeedName;
  }
  if (body.bagsArrivedCount !== undefined || body.BagsArrivedCount !== undefined) {
    existing.bagsArrivedCount = body.bagsArrivedCount ?? body.BagsArrivedCount;
  }
  if (body.driverName !== undefined || body.DriverName !== undefined) {
    existing.driverName = body.driverName ?? body.DriverName;
  }
  if (body.driverPhoneNumber !== undefined || body.DriverPhoneNumber !== undefined) {
    existing.driverPhoneNumber = body.driverPhoneNumber ?? body.DriverPhoneNumber;
  }

  await feedRepo.save(existing);

  return {
    message: "Feed inventory record updated successfully.",
  };
};

export const softDeleteFeedInventory = async (idParam) => {
  const id = parseInt(idParam, 10);
  if (!id || id <= 0) {
    throw ApiError.badRequest("Invalid ID");
  }

  const feedRepo = getFeedRepo();
  const result = await feedRepo.update({ id, isDeleted: false }, { isDeleted: true });

  if (result.affected === 0) {
    throw ApiError.notFound("Record not found or already deleted.");
  }

  return {
    message: "Record soft-deleted successfully.",
    updatedRecords: result.affected,
  };
};

export const deleteFeedInventory = async (idParam) => {
  const id = parseInt(idParam, 10);
  if (!id || id <= 0) {
    throw ApiError.badRequest("Invalid ID");
  }

  const feedRepo = getFeedRepo();
  const result = await feedRepo.delete(id);

  if (result.affected === 0) {
    throw ApiError.notFound("Record not found.");
  }

  return {
    message: "Record permanently deleted successfully.",
    deletedRecords: result.affected,
  };
};

export default {
  getAllFeedInventories,
  createFeedInventory,
  updateFeedInventory,
  softDeleteFeedInventory,
  deleteFeedInventory,
};
