import app from "./app.js";
import config from "./core/config/env.config.js";
import connectDB, { disconnectDB } from "./core/database/dbConnect.js";
import logger from "./core/utils/logger.js";
import {
  startDailyReminderScheduler,
  stopDailyReminderScheduler,
} from "./modules/notifications/dailyReminder.scheduler.js";

const startServer = async () => {
  try {
    const PORT = config.port || 5256;
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
      startDailyReminderScheduler();
    });

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Closing HTTP server...`);
      stopDailyReminderScheduler();

      server.close(async () => {
        logger.info("HTTP server closed.");

        try {
          await disconnectDB();
          process.exit(0);
        } catch (err) {
          logger.error(`Error during connection closure: ${err.message}`);
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error("Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.name}: ${err.message}`);
});

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.name}: ${err.message}`);
});

startServer();
