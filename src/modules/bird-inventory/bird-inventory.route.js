import express from "express";
import validate from "../../core/middlewares/validate.middleware.js";
import * as birdValidation from "./bird-inventory.validation.js";
import * as birdController from "./bird-inventory.controller.js";

export const routePrefix = "/BirdsInventory";

const router = express.Router();

router.get("/", birdController.getAll);
router.get("/:id", birdController.getByBatch);
router.post("/", validate(birdValidation.createBirdInventorySchema), birdController.create);
router.put("/:id", validate(birdValidation.updateBirdInventorySchema), birdController.update);
router.patch("/soft-delete/:id", birdController.softDelete);
router.delete("/:id", birdController.remove);
router.delete("/", birdController.remove);

export default router;
