import express from "express";
import { optionalAuthenticate } from "../../core/middlewares/auth.middleware.js";
import * as dashboardController from "./dashboard.controller.js";

export const routePrefix = "/DashBoard";

const router = express.Router();

router.get("/", optionalAuthenticate, dashboardController.getDashboard);

export default router;
