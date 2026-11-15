import "reflect-metadata";
import { DataSource } from "typeorm";
import config from "../config/env.config.js";
import logger from "../utils/logger.js";
import { entities } from "../../entities/index.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: config.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  synchronize: false, // Maintain existing PostgreSQL schema
  logging: config.nodeEnv === "development" ? ["error", "warn"] : ["error"],
  entities: entities,
});

export const connectDB = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info("Database connected successfully with TypeORM.");
    }
    return AppDataSource;
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    // Don't crash process if DB is temporarily unreachable in dev/offline
    if (config.nodeEnv === "production") {
      throw error;
    }
    return null;
  }
};

export const disconnectDB = async () => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info("Database connection closed.");
    }
  } catch (error) {
    logger.error(`Error closing database connection: ${error.message}`);
  }
};

export default connectDB;
