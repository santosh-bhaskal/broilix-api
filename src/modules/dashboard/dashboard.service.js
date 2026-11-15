import { AppDataSource } from "../../core/database/dbConnect.js";
import { BATCH_STATUS } from "../../core/constants/constants.js";
import ApiError from "../../core/utils/ApiError.js";

const getBatchRepo = () => AppDataSource.getRepository("Batch");
const getBirdRepo = () => AppDataSource.getRepository("BirdInventory");
const getDailyRepo = () => AppDataSource.getRepository("DailyRecord");
const getFeedRepo = () => AppDataSource.getRepository("FeedInventory");

export const getDashboardData = async () => {
  const batchRepo = getBatchRepo();
  const latestBatch = await batchRepo.findOne({
    where: { status: BATCH_STATUS.ONGOING, isDeleted: false },
    order: { id: "DESC" },
  });

  if (!latestBatch) {
    throw ApiError.notFound("No active batch found.");
  }

  const batchId = latestBatch.id;

  const birdRepo = getBirdRepo();
  const birdInventory = await birdRepo.findOne({
    where: { batchId, isDeleted: false },
  });

  if (!birdInventory) {
    throw ApiError.badRequest("Bird arrival not yet recorded for this batch.");
  }

  const housedBirds = birdInventory.housedBirdCount || 0;

  const dailyRepo = getDailyRepo();
  const dailyRecords = await dailyRepo.find({
    where: { batchId, isDeleted: false },
  });

  const totalMortality = dailyRecords.reduce((acc, curr) => acc + (curr.mortalityCount || 0), 0);
  const totalAliveBirds = housedBirds - totalMortality;
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
    },
    data: {
      totalMortality,
      totalAliveBirds,
      totalFeedConsume,
      totalFeedBags,
      totalFeedBagsAvailable,
    },
  };
};

export default {
  getDashboardData,
};
