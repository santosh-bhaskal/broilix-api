import express from "express";
import { authenticate } from "../../core/middlewares/auth.middleware.js";
import validate from "../../core/middlewares/validate.middleware.js";
import * as batchValidation from "./batch.validation.js";
import * as batchController from "./batch.controller.js";

export const routePrefix = "/Batch";

const router = express.Router();

router.use(authenticate);

router.post("/", validate(batchValidation.createBatchSchema), batchController.create);
router.get("/active", batchController.getActiveBatch);
router.patch("/close/:batchId", batchController.closeBatch);
router.get("/", batchController.getAll);

export default router;
