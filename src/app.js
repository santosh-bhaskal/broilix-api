import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import { requestId } from "./core/middlewares/requestId.js";
import handleError from "./core/middlewares/error.middleware.js";
import config from "./core/config/env.config.js";
import connectDB from "./core/database/dbConnect.js";
import apiRouter from "./routes/index.js";

const app = express();

app.set("case sensitive routing", false);
app.use(requestId);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }),
);

// Allow all origins (browsers, mobile Capacitor apps, ngrok tunnels, localhost)
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
      "Accept",
      "X-Requested-With",
      "Origin",
    ],
    exposedHeaders: ["*"],
  }),
);
app.options("*", cors());

if (config.nodeEnv === "production") {
  app.use(compression());
}

app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);

app.get("/", (_, res) => {
  res.json({
    message: "Welcome to Poultry Management System API",
    status: "active",
    environment: config.nodeEnv,
  });
});

app.get("/health", (_, res) => {
  res.json({
    status: "OK",
    service: "poultry-api",
    timestamp: new Date().toISOString(),
  });
});

// Ensure database is connected (essential for serverless deployments like Vercel)
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Mount modular API router
app.use("/api", apiRouter);

// 404 handler
app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use(handleError);

export default app;
