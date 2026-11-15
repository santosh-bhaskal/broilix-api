import * as dailyService from "./daily-record.service.js";
import asyncHandler from "../../core/utils/asyncHandler.js";
import { HttpStatus } from "../../core/constants/httpStatus.js";

export const getAll = asyncHandler(async (req, res) => {
  const result = await dailyService.getAllDailyRecords();
  return res.status(HttpStatus.OK).json(result);
});

export const getByBatch = asyncHandler(async (req, res) => {
  const result = await dailyService.getDailyRecordsByBatch(req.params.batchId);
  return res.status(HttpStatus.OK).json(result);
});

export const create = asyncHandler(async (req, res) => {
  const result = await dailyService.createDailyRecord(req.body);
  if (result.status) {
    return res.status(result.status).json(result.body);
  }
  return res.status(HttpStatus.OK).json(result);
});

export const update = asyncHandler(async (req, res) => {
  const result = await dailyService.updateDailyRecord(req.params.id, req.body);
  return res.status(HttpStatus.OK).json(result);
});

export const softDelete = asyncHandler(async (req, res) => {
  const result = await dailyService.softDeleteDailyRecord(req.params.id);
  return res.status(HttpStatus.OK).json(result);
});

export const remove = asyncHandler(async (req, res) => {
  const result = await dailyService.deleteDailyRecord(req.params.id);
  return res.status(HttpStatus.OK).json(result);
});

export default {
  getAll,
  getByBatch,
  create,
  update,
  softDelete,
  remove,
};
