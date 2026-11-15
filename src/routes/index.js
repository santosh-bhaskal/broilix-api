import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import logger from "../core/utils/logger.js";
import { optionalAuthenticate } from "../core/middlewares/auth.middleware.js";

const apiRouter = express.Router();
apiRouter.use(optionalAuthenticate);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modulesDir = path.join(__dirname, "../modules");

const getRouteFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getRouteFiles(filePath));
    } else if (file.endsWith(".route.js")) {
      results.push(filePath);
    }
  }
  return results;
};

const routeFiles = getRouteFiles(modulesDir);

for (const file of routeFiles) {
  const fileUrl = pathToFileURL(file).href;
  const module = await import(fileUrl);

  const prefix =
    module.routePrefix || module.prefix || module.path || `/${path.basename(path.dirname(file))}`;

  if (module.default) {
    const formattedPrefix = prefix.startsWith("/") ? prefix : `/${prefix}`;
    apiRouter.use(formattedPrefix, module.default);

    // Also mount lowercase variant if different for case-insensitive URL support
    if (formattedPrefix.toLowerCase() !== formattedPrefix) {
      apiRouter.use(formattedPrefix.toLowerCase(), module.default);
    }
    logger.info(`Mounted route [${formattedPrefix}] from ${path.basename(file)}`);
  }
}

export default apiRouter;
