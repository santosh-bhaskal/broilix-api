import * as birdService from "./bird-inventory.service.js";
import asyncHandler from "../../core/utils/asyncHandler.js";
import { HttpStatus } from "../../core/constants/httpStatus.js";

export const getAll = asyncHandler(async (req, res) => {
  const result = await birdService.getAllBirdInventories();
  return res.status(HttpStatus.OK).json(result);
});

export const getByBatch = asyncHandler(async (req, res) => {
  const result = await birdService.getBirdInventoryByBatch(req.params.id);
  return res.status(HttpStatus.OK).json(result);
});

export const create = asyncHandler(async (req, res) => {
  const result = await birdService.createBirdInventory(req.body);
  return res.status(HttpStatus.OK).json(result);
});

export const update = asyncHandler(async (req, res) => {
  const result = await birdService.updateBirdInventory(req.params.id, req.body);
  return res.status(HttpStatus.OK).json(result);
});

export const softDelete = asyncHandler(async (req, res) => {
  const result = await birdService.softDeleteBirdInventory(req.params.id);
  return res.status(HttpStatus.OK).json(result);
});

export const remove = asyncHandler(async (req, res) => {
  const id = req.query.id || req.params.id;
  const result = await birdService.deleteBirdInventory(id);
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
