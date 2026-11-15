import Joi from "joi";

export const createFeedInventorySchema = Joi.object({
  date: Joi.date().iso().optional(),
  Date: Joi.date().iso().optional(),
  feedName: Joi.string().allow("").optional(),
  FeedName: Joi.string().allow("").optional(),
  bagsArrivedCount: Joi.number().optional(),
  BagsArrivedCount: Joi.number().optional(),
  driverName: Joi.string().allow("").optional(),
  DriverName: Joi.string().allow("").optional(),
  driverPhoneNumber: Joi.string().allow("").optional(),
  DriverPhoneNumber: Joi.string().allow("").optional(),
});

export const updateFeedInventorySchema = Joi.object({
  date: Joi.date().iso().optional(),
  Date: Joi.date().iso().optional(),
  feedName: Joi.string().allow("").optional(),
  FeedName: Joi.string().allow("").optional(),
  bagsArrivedCount: Joi.number().optional(),
  BagsArrivedCount: Joi.number().optional(),
  driverName: Joi.string().allow("").optional(),
  DriverName: Joi.string().allow("").optional(),
  driverPhoneNumber: Joi.string().allow("").optional(),
  DriverPhoneNumber: Joi.string().allow("").optional(),
});

export default {
  createFeedInventorySchema,
  updateFeedInventorySchema,
};
