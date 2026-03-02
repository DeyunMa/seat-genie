import pino from "pino";
import { config } from "./config/env";

const logger = pino({
  level: config.logLevel,
  redact: ["req.headers.authorization"],
});

export { logger };
