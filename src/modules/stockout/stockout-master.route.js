import express from "express";
import validate from "../../core/middlewares/validate.middleware.js";
import * as stockoutValidation from "./stockout.validation.js";
import * as stockoutController from "./stockout.controller.js";

export const routePrefix = "/stockout/master";

const router = express.Router();

router.get("/", stockoutController.getAllMasters);
router.get("/:masterId", stockoutController.getMasterById);
router.post("/", stockoutController.createMaster);
router.put("/finalize/:id", validate(stockoutValidation.finalizeMasterSchema), stockoutController.finalizeMaster);
router.patch("/soft-delete/:id", stockoutController.softDeleteMaster);

export default router;
