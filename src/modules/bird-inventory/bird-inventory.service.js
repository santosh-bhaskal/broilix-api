import { AppDataSource } from "../../core/database/dbConnect.js";
import { BATCH_STATUS } from "../../core/constants/constants.js";
import { normalizeToUtc } from "../../core/utils/dateHelper.js";
import ApiError from "../../core/utils/ApiError.js";
import { In, IsNull } from "typeorm";

const getBirdRepo = () => AppDataSource.getRepository("BirdInventory");
const getBatchRepo = () => AppDataSource.getRepository("Batch");

export const getAllBirdInventories = async (userId = null) => {
  const birdRepo = getBirdRepo();
  const batchRepo = getBatchRepo();

  let inventories = [];
  if (userId) {
    const userBatches = await batchRepo.find({
      where: [{ userId, isDeleted: false }, { isDeleted: false, userId: IsNull() }],
    });
    const batchIds = userBatches.map((b) => b.id);
    if (batchIds.length > 0) {
      inventories = await birdRepo.find({
        where: { batchId: In(batchIds), isDeleted: false },
        order: { id: "DESC" },
      });
    }
  } else {
    inventories = await birdRepo.find({
      where: { isDeleted: false },
      order: { id: "DESC" },
    });
  }

  return {
    message: "Bird inventories fetched successfully",
    data: inventories,
  };
};

export const getBirdInventoryByBatch = async (batchId) => {
  const id = parseInt(batchId, 10);
  if (!id || isNaN(id)) {
    throw ApiError.badRequest("Invalid batch ID.");
  }

  const birdRepo = getBirdRepo();
  const inv = await birdRepo.findOne({
    where: { batchId: id, isDeleted: false },
  });

  if (!inv) {
    throw ApiError.notFound("No bird inventory found.");
  }

  return {
    message: "Bird Inventory found successfully",
    data: inv,
  };
};

export const createBirdInventory = async (body, userId = null) => {
  const batchRepo = getBatchRepo();
  const resolvedUserId = userId ?? body.userId ?? body.UserId ?? null;

  const where = resolvedUserId
    ? { status: BATCH_STATUS.ONGOING, isDeleted: false, userId: resolvedUserId }
    : { status: BATCH_STATUS.ONGOING, isDeleted: false };

  const existingBatch = await batchRepo.findOne({ where });

  if (existingBatch) {
    throw ApiError.badRequest("Another batch is already active for your account. Close it before starting a new batch.");
  }

  const batchNo = body.batchNo ?? body.BatchNo ?? 1;
  const date = normalizeToUtc(body.date ?? body.Date);

  // TypeORM transaction
  return await AppDataSource.transaction(async (manager) => {
    const batch = manager.create("Batch", {
      batchNo,
      startDate: new Date(),
      status: BATCH_STATUS.ONGOING,
      isDeleted: false,
      userId: resolvedUserId,
    });
    await manager.save(batch);

    const newInventory = manager.create("BirdInventory", {
      batchId: batch.id,
      date,
      boxCount: body.boxCount ?? body.BoxCount ?? 0,
      birdsPerBoxCount: body.birdsPerBoxCount ?? body.BirdsPerBoxCount ?? 0,
      totalBirdCount: body.totalBirdCount ?? body.TotalBirdCount ?? 0,
      birdsArrivedCount: body.birdsArrivedCount ?? body.BirdsArrivedCount ?? 0,
      boxMortalityCount: body.boxMortalityCount ?? body.BoxMortalityCount ?? 0,
      disabledBirdCount: body.disabledBirdCount ?? body.DisabledBirdCount ?? 0,
      weakBirdCount: body.weakBirdCount ?? body.WeakBirdCount ?? 0,
      shortBirdCount: body.shortBirdCount ?? body.ShortBirdCount ?? 0,
      excessBirdCount: body.excessBirdCount ?? body.ExcessBirdCount ?? 0,
      housedBirdCount: body.housedBirdCount ?? body.HousedBirdCount ?? 0,
      isDeleted: false,
    });
    await manager.save(newInventory);

    return {
      message: "Record created successfully",
      data: {
        id: newInventory.id,
        batchId: newInventory.batchId,
        date: newInventory.date,
        housedBirdCount: newInventory.housedBirdCount,
        totalBirdCount: newInventory.totalBirdCount,
      },
    };
  });
};

export const updateBirdInventory = async (idParam, body) => {
  const id = parseInt(idParam, 10);
  if (!id || isNaN(id)) {
    throw ApiError.badRequest("Invalid ID.");
  }

  const birdRepo = getBirdRepo();
  const existing = await birdRepo.findOne({
    where: { id, isDeleted: false },
  });

  if (!existing) {
    throw ApiError.notFound("Record not found or already deleted");
  }

  const date = normalizeToUtc(body.date ?? body.Date);

  existing.date = date;
  if (body.batchId !== undefined || body.BatchId !== undefined) {
    existing.batchId = body.batchId ?? body.BatchId;
  }
  if (body.boxCount !== undefined || body.BoxCount !== undefined) {
    existing.boxCount = body.boxCount ?? body.BoxCount;
  }
  if (body.birdsPerBoxCount !== undefined || body.BirdsPerBoxCount !== undefined) {
    existing.birdsPerBoxCount = body.birdsPerBoxCount ?? body.BirdsPerBoxCount;
  }
  if (body.totalBirdCount !== undefined || body.TotalBirdCount !== undefined) {
    existing.totalBirdCount = body.totalBirdCount ?? body.TotalBirdCount;
  }
  if (body.birdsArrivedCount !== undefined || body.BirdsArrivedCount !== undefined) {
    existing.birdsArrivedCount = body.birdsArrivedCount ?? body.BirdsArrivedCount;
  }
  if (body.boxMortalityCount !== undefined || body.BoxMortalityCount !== undefined) {
    existing.boxMortalityCount = body.boxMortalityCount ?? body.BoxMortalityCount;
  }
  if (body.disabledBirdCount !== undefined || body.DisabledBirdCount !== undefined) {
    existing.disabledBirdCount = body.disabledBirdCount ?? body.DisabledBirdCount;
  }
  if (body.weakBirdCount !== undefined || body.WeakBirdCount !== undefined) {
    existing.weakBirdCount = body.weakBirdCount ?? body.WeakBirdCount;
  }
  if (body.shortBirdCount !== undefined || body.ShortBirdCount !== undefined) {
    existing.shortBirdCount = body.shortBirdCount ?? body.ShortBirdCount;
  }
  if (body.excessBirdCount !== undefined || body.ExcessBirdCount !== undefined) {
    existing.excessBirdCount = body.excessBirdCount ?? body.ExcessBirdCount;
  }
  if (body.housedBirdCount !== undefined || body.HousedBirdCount !== undefined) {
    existing.housedBirdCount = body.housedBirdCount ?? body.HousedBirdCount;
  }

  await birdRepo.save(existing);

  return {
    message: "Record updated successfully",
    updatedRows: 1,
  };
};

export const softDeleteBirdInventory = async (idParam) => {
  const id = parseInt(idParam, 10);
  if (!id || id <= 0) {
    throw ApiError.badRequest("Invalid ID");
  }

  const birdRepo = getBirdRepo();
  const result = await birdRepo.update({ id, isDeleted: false }, { isDeleted: true });

  if (result.affected === 0) {
    throw ApiError.notFound("Record not found or already deleted");
  }

  return {
    message: "Record soft-deleted successfully",
    updatedRecords: result.affected,
  };
};

export const deleteBirdInventory = async (idParam) => {
  const id = parseInt(idParam, 10);
  if (!id || id <= 0) {
    throw ApiError.badRequest("Invalid ID");
  }

  const birdRepo = getBirdRepo();
  const result = await birdRepo.delete(id);

  if (result.affected === 0) {
    throw ApiError.notFound("Record not found");
  }

  return {
    message: "Record permanently deleted successfully",
    deletedRecords: result.affected,
  };
};

export default {
  getAllBirdInventories,
  getBirdInventoryByBatch,
  createBirdInventory,
  updateBirdInventory,
  softDeleteBirdInventory,
  deleteBirdInventory,
};
