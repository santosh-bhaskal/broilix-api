import * as batchService from "./batch.service.js";
import asyncHandler from "../../core/utils/asyncHandler.js";
import { HttpStatus } from "../../core/constants/httpStatus.js";

export const create = asyncHandler(async (req, res) => {
  const result = await batchService.createBatch(req.body);
  return res.status(HttpStatus.OK).json(result);
});

export const getActiveBatch = asyncHandler(async (req, res) => {
  const result = await batchService.getActiveBatch();
  return res.status(HttpStatus.OK).json(result);
});

export const closeBatch = asyncHandler(async (req, res) => {
  const result = await batchService.closeBatch(req.params.batchId);
  return res.status(HttpStatus.OK).send(result);
});

export const getAll = asyncHandler(async (req, res) => {
  const result = await batchService.getAllBatches();
  return res.status(HttpStatus.OK).json(result);
});

export default {
  create,
  getActiveBatch,
  closeBatch,
  getAll,
};
