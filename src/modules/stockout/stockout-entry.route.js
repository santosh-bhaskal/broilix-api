import express from "express";
import validate from "../../core/middlewares/validate.middleware.js";
import * as stockoutValidation from "./stockout.validation.js";
import * as stockoutController from "./stockout.controller.js";

export const routePrefix = "/stockout/entry";

const router = express.Router();

router.post("/", validate(stockoutValidation.createEntrySchema), stockoutController.addEntry);
router.get("/:masterId", stockoutController.getEntriesByMaster);
router.put("/:id", validate(stockoutValidation.updateEntrySchema), stockoutController.editEntry);
router.delete("/:id", stockoutController.deleteEntry);

export default router;
