import express from "express";
import { authenticate } from "../../core/middlewares/auth.middleware.js";
import validate from "../../core/middlewares/validate.middleware.js";
import * as reportValidation from "./final-report.validation.js";
import * as reportController from "./final-report.controller.js";

export const routePrefix = "/FinalReport";

const router = express.Router();

router.use(authenticate);

router.get("/prepare", reportController.getPrepareData);
router.get("/", reportController.getAll);
router.get("/:id", reportController.getById);
router.post("/", validate(reportValidation.createFinalReportSchema), reportController.create);
router.put("/:id", validate(reportValidation.updateFinalReportSchema), reportController.update);
router.patch("/soft-delete/:id", reportController.softDelete);
router.delete("/:id", reportController.remove);

export default router;
