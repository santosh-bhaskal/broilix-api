import express from "express";
import validate from "../../core/middlewares/validate.middleware.js";
import * as feedValidation from "./feed-inventory.validation.js";
import * as feedController from "./feed-inventory.controller.js";

export const routePrefix = "/FeedInventory";

const router = express.Router();

router.get("/", feedController.getAll);
router.post("/", validate(feedValidation.createFeedInventorySchema), feedController.create);
router.put("/:id", validate(feedValidation.updateFeedInventorySchema), feedController.update);
router.patch("/soft-delete/:id", feedController.softDelete);
router.delete("/:id", feedController.remove);

export default router;
