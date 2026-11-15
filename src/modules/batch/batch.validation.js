import Joi from "joi";

export const createBatchSchema = Joi.object({
  batchNo: Joi.number().optional(),
  BatchNo: Joi.number().optional(),
  userId: Joi.number().optional().allow(null),
  UserId: Joi.number().optional().allow(null),
});

export default {
  createBatchSchema,
};
