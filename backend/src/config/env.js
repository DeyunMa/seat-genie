const path = require("path");
const { z } = require("zod");
require("dotenv").config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_FILE: z.string().default("data/library.db"),
  LOG_LEVEL: z.string().default("info"),
});

const env = envSchema.parse(process.env);

// 数据库路径相对于 backend 目录（从 src/config 回退两级）
const backendDir = path.join(__dirname, "..", "..");
const config = {
  port: env.PORT,
  logLevel: env.LOG_LEVEL,
  databaseFile: path.resolve(backendDir, env.DATABASE_FILE),
};

module.exports = { config };
