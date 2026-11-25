import * as stockoutService from "./stockout.service.js";
import asyncHandler from "../../core/utils/asyncHandler.js";
import { HttpStatus } from "../../core/constants/httpStatus.js";
import { getUserIdFromReq } from "../../core/utils/jwtHelper.js";

// Master Controllers
export const getAllMasters = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req);
  const result = await stockoutService.getAllMasters(userId);
  return res.status(HttpStatus.OK).json(result);
});

export const getMasterById = asyncHandler(async (req, res) => {
  const result = await stockoutService.getMasterById(req.params.masterId);
  return res.status(HttpStatus.OK).json(result);
});

export const createMaster = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req);
  const result = await stockoutService.createMaster(userId, req.body);
  return res.status(HttpStatus.OK).json(result);
});

export const finalizeMaster = asyncHandler(async (req, res) => {
  const result = await stockoutService.finalizeMaster(req.params.id, req.body);
  return res.status(HttpStatus.OK).send(result);
});

// Entry Controllers
export const addEntry = asyncHandler(async (req, res) => {
  const result = await stockoutService.addEntry(req.body);
  return res.status(HttpStatus.OK).json(result);
});

export const getEntriesByMaster = asyncHandler(async (req, res) => {
  const result = await stockoutService.getEntriesByMaster(req.params.masterId);
  return res.status(HttpStatus.OK).json(result);
});

export const editEntry = asyncHandler(async (req, res) => {
  const result = await stockoutService.editEntry(req.params.id, req.body);
  return res.status(HttpStatus.OK).json(result);
});

export const deleteEntry = asyncHandler(async (req, res) => {
  const result = await stockoutService.deleteEntry(req.params.id);
  return res.status(HttpStatus.OK).send(result);
});

export const softDeleteMaster = asyncHandler(async (req, res) => {
  const result = await stockoutService.softDeleteMaster(req.params.id);
  return res.status(HttpStatus.OK).json(result);
});

export default {
  getAllMasters,
  getMasterById,
  createMaster,
  finalizeMaster,
  addEntry,
  getEntriesByMaster,
  editEntry,
  deleteEntry,
  softDeleteMaster,
};
