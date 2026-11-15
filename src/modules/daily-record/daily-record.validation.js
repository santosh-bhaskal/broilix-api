import Joi from "joi";

export const createDailyRecordSchema = Joi.object({
  date: Joi.date().iso().optional(),
  Date: Joi.date().iso().optional(),
  birdAgeInDays: Joi.number().optional(),
  BirdAgeInDays: Joi.number().optional(),
  feedConsumedBags: Joi.number().optional(),
  FeedConsumedBags: Joi.number().optional(),
  mortalityCount: Joi.number().optional(),
  MortalityCount: Joi.number().optional(),
});

export const updateDailyRecordSchema = Joi.object({
  date: Joi.date().iso().optional(),
  Date: Joi.date().iso().optional(),
  birdAgeInDays: Joi.number().optional(),
  BirdAgeInDays: Joi.number().optional(),
  feedConsumedBags: Joi.number().optional(),
  FeedConsumedBags: Joi.number().optional(),
  mortalityCount: Joi.number().optional(),
  MortalityCount: Joi.number().optional(),
});

export default {
  createDailyRecordSchema,
  updateDailyRecordSchema,
};
