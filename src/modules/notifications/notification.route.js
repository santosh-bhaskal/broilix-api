import express from "express";
import validate from "../../core/middlewares/validate.middleware.js";
import { authenticate } from "../../core/middlewares/auth.middleware.js";
import * as controller from "./notification.controller.js";
import * as validation from "./notification.validation.js";

export const routePrefix = "/Notifications";
const router = express.Router();

router.post("/push-token", authenticate, validate(validation.registerPushTokenSchema), controller.registerPushToken);
router.delete("/push-token", authenticate, validate(validation.unregisterPushTokenSchema), controller.unregisterPushToken);
router.post("/test", authenticate, validate(validation.sendTestNotificationSchema), controller.sendTestNotification);

export default router;
