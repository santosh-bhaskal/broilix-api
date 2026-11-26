import { AppDataSource } from "../../core/database/dbConnect.js";
import { BATCH_STATUS } from "../../core/constants/constants.js";

const getBatchRepo = () => AppDataSource.getRepository("Batch");
const getBirdRepo = () => AppDataSource.getRepository("BirdInventory");
const getDailyRepo = () => AppDataSource.getRepository("DailyRecord");
const getFeedRepo = () => AppDataSource.getRepository("FeedInventory");

export const getDashboardData = async (userId = null) => {
  const batchRepo = getBatchRepo();

  // Only find active ongoing batch for this specific user
  let latestBatch = null;
  if (userId) {
    latestBatch = await batchRepo.findOne({
      where: { userId, status: BATCH_STATUS.ONGOING, isDeleted: false },
      order: { id: "DESC" },
    });
  }

  // If no active batch found, return zeroed summary gracefully
  if (!latestBatch) {
    return {
      message: "No active batch found",
      data: {
        totalMortality: 0,
        totalAliveBirds: 0,
        totalFeedConsume: 0,
        totalFeedBags: 0,
        totalFeedBagsAvailable: 0,
        activeBatchId: null,
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
    message: "Dashboard fetched successfully",
    data: {
      totalMortality,
      totalAliveBirds,
      totalFeedConsume,
      totalFeedBags,
      totalFeedBagsAvailable,
      activeBatchId: batchId,
    },
  };
};

export default {
  getDashboardData,
};
