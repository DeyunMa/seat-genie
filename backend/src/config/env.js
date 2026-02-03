const path = require("path");
const { z } = require("zod");
require("dotenv").config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_FILE: z.string().default("backend/data/library.db"),
  LOG_LEVEL: z.string().default("info"),
});

const env = envSchema.parse(process.env);

const config = {
  port: env.PORT,
  logLevel: env.LOG_LEVEL,
  databaseFile: path.resolve(env.DATABASE_FILE),
};

module.exports = { config };
