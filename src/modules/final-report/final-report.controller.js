import * as reportService from "./final-report.service.js";
import asyncHandler from "../../core/utils/asyncHandler.js";
import { HttpStatus } from "../../core/constants/httpStatus.js";

export const getAll = asyncHandler(async (req, res) => {
  const result = await reportService.getAllReports();
  return res.status(HttpStatus.OK).json(result);
});

export const getById = asyncHandler(async (req, res) => {
  const result = await reportService.getReportById(req.params.id);
  return res.status(HttpStatus.OK).json(result);
});

export const create = asyncHandler(async (req, res) => {
  const result = await reportService.createReport(req.body);
  return res.status(HttpStatus.CREATED).json(result);
});

export const update = asyncHandler(async (req, res) => {
  const result = await reportService.updateReport(req.params.id, req.body);
  return res.status(HttpStatus.OK).json(result);
});

export const softDelete = asyncHandler(async (req, res) => {
  const result = await reportService.softDeleteReport(req.params.id);
  return res.status(HttpStatus.OK).json(result);
});

export const remove = asyncHandler(async (req, res) => {
  const result = await reportService.deleteReport(req.params.id);
  return res.status(HttpStatus.OK).json(result);
});

export const getPrepareData = asyncHandler(async (req, res) => {
  const result = await reportService.getPrepareData();
  return res.status(HttpStatus.OK).json(result);
});

export default {
  getAll,
  getById,
  create,
  update,
  softDelete,
  remove,
  getPrepareData,
};
