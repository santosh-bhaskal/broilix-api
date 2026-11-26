import express from "express";
import { authenticate } from "../../core/middlewares/auth.middleware.js";
import validate from "../../core/middlewares/validate.middleware.js";
import * as dailyValidation from "./daily-record.validation.js";
import * as dailyController from "./daily-record.controller.js";

export const routePrefix = "/DailyRecord";

const router = express.Router();

router.use(authenticate);

router.get("/", dailyController.getAll);
router.get("/:batchId", dailyController.getByBatch);
router.post("/", validate(dailyValidation.createDailyRecordSchema), dailyController.create);
router.put("/:id", validate(dailyValidation.updateDailyRecordSchema), dailyController.update);
router.patch("/soft-delete/:id", dailyController.softDelete);
router.delete("/:id", dailyController.remove);

export default router;
