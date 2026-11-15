import Joi from "joi";

export const finalizeMasterSchema = Joi.object({
  totalBirds: Joi.number().required(),
  TotalBirds: Joi.number().optional(),
  totalWeight: Joi.number().required(),
  TotalWeight: Joi.number().optional(),
  avgWeight: Joi.number().required(),
  AvgWeight: Joi.number().optional(),
  date: Joi.date().iso().optional(),
  Date: Joi.date().iso().optional(),
});

export const createEntrySchema = Joi.object({
  stockOutMasterId: Joi.number().optional(),
  StockOutMasterId: Joi.number().optional(),
  birds: Joi.number().required(),
  Birds: Joi.number().optional(),
  weight: Joi.number().required(),
  Weight: Joi.number().optional(),
}).or("stockOutMasterId", "StockOutMasterId");

export const updateEntrySchema = Joi.object({
  id: Joi.number().optional(),
  Id: Joi.number().optional(),
  srNo: Joi.number().optional(),
  SrNo: Joi.number().optional(),
  birds: Joi.number().required(),
  Birds: Joi.number().optional(),
  weight: Joi.number().required(),
  Weight: Joi.number().optional(),
});

export default {
  finalizeMasterSchema,
  createEntrySchema,
  updateEntrySchema,
};
