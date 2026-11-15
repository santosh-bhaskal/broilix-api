import { AppDataSource } from "../../core/database/dbConnect.js";
import { BATCH_STATUS } from "../../core/constants/constants.js";

const getBatchRepo = () => AppDataSource.getRepository("Batch");
const getBirdRepo = () => AppDataSource.getRepository("BirdInventory");
const getDailyRepo = () => AppDataSource.getRepository("DailyRecord");
const getFeedRepo = () => AppDataSource.getRepository("FeedInventory");

export const getDashboardData = async (userId = null) => {
  const batchRepo = getBatchRepo();

  // 1. Try to find active ongoing batch for this specific user
  let latestBatch = null;
  if (userId) {
    latestBatch = await batchRepo.findOne({
      where: { userId, status: BATCH_STATUS.ONGOING, isDeleted: false },
      order: { id: "DESC" },
    });
  }

  // 2. Fallback to active ongoing batch where userId is null (shared/legacy batches)
  if (!latestBatch) {
    latestBatch = await batchRepo.findOne({
      where: { status: BATCH_STATUS.ONGOING, isDeleted: false },
      order: { id: "DESC" },
    });
  }

  // If no active batch found, return zeroed summary gracefully
  if (!latestBatch) {
    return {
      Message: "No active batch found",
      message: "No active batch found",
      Data: {
        TotalMortality: 0,
        TotalAliveBirds: 0,
        TotalFeedConsume: 0,
        TotalFeedBags: 0,
        TotalFeedBagsAvailable: 0,
        totalMortality: 0,
        totalAliveBirds: 0,
        totalFeedConsume: 0,
        totalFeedBags: 0,
        totalFeedBagsAvailable: 0,
      },
      data: {
        totalMortality: 0,
        totalAliveBirds: 0,
        totalFeedConsume: 0,
        totalFeedBags: 0,
        totalFeedBagsAvailable: 0,
        TotalMortality: 0,
        TotalAliveBirds: 0,
        TotalFeedConsume: 0,
        TotalFeedBags: 0,
        TotalFeedBagsAvailable: 0,
      },
    };
  }

  const batchId = latestBatch.id;

  const birdRepo = getBirdRepo();
  const birdInventory = await birdRepo.findOne({
    where: { batchId, isDeleted: false },
  });

  const housedBirds = birdInventory?.housedBirdCount || 0;

  const dailyRepo = getDailyRepo();
  const dailyRecords = await dailyRepo.find({
    where: { batchId, isDeleted: false },
  });

  const totalMortality = dailyRecords.reduce((acc, curr) => acc + (curr.mortalityCount || 0), 0);
  const totalAliveBirds = Math.max(0, housedBirds - totalMortality);
  const totalFeedConsume = dailyRecords.reduce((acc, curr) => acc + (curr.feedConsumedBags || 0), 0);

  const feedRepo = getFeedRepo();
  const feedInventories = await feedRepo.find({
    where: { batchId, isDeleted: false },
  });

  const totalFeedBags = feedInventories.reduce((acc, curr) => acc + (curr.bagsArrivedCount || 0), 0);
  const totalFeedBagsAvailable = totalFeedBags - totalFeedConsume;

  return {
    Message: "Dashboard fetched successfully",
    message: "Dashboard fetched successfully",
    Data: {
      TotalMortality: totalMortality,
      TotalAliveBirds: totalAliveBirds,
      TotalFeedConsume: totalFeedConsume,
      TotalFeedBags: totalFeedBags,
      TotalFeedBagsAvailable: totalFeedBagsAvailable,
      // camelCase
      totalMortality,
      totalAliveBirds,
      totalFeedConsume,
      totalFeedBags,
      totalFeedBagsAvailable,
      activeBatchId: batchId,
      ActiveBatchId: batchId,
    },
    data: {
      totalMortality,
      totalAliveBirds,
      totalFeedConsume,
      totalFeedBags,
      totalFeedBagsAvailable,
      activeBatchId: batchId,
      // PascalCase
      TotalMortality: totalMortality,
      TotalAliveBirds: totalAliveBirds,
      TotalFeedConsume: totalFeedConsume,
      TotalFeedBags: totalFeedBags,
      TotalFeedBagsAvailable: totalFeedBagsAvailable,
      ActiveBatchId: batchId,
    },
  };
};

export default {
  getDashboardData,
};
