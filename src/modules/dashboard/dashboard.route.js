import express from "express";
import { authenticate } from "../../core/middlewares/auth.middleware.js";
import * as dashboardController from "./dashboard.controller.js";

export const routePrefix = "/DashBoard";

const router = express.Router();

router.get("/", authenticate, dashboardController.getDashboard);

export default router;
