import express from "express";
import validate from "../../core/middlewares/validate.middleware.js";
import * as authValidation from "./auth.validation.js";
import * as authController from "./auth.controller.js";

export const routePrefix = "/Auth";

const router = express.Router();

router.post("/login", validate(authValidation.loginSchema), authController.login);
router.post("/signup", validate(authValidation.signupSchema), authController.signup);
router.post("/reset-password", validate(authValidation.resetPasswordSchema), authController.resetPassword);

export default router;
