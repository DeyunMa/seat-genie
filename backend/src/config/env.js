const path = require("path");
const { z } = require("zod");
require("dotenv").config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_FILE: z.string().default("data/library.db"),
  LOG_LEVEL: z.string().default("info"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_SECRET: z.string().optional(),
});

const env = envSchema.parse(process.env);

// Enforce JWT_SECRET in production
let jwtSecret = env.JWT_SECRET;
if (env.NODE_ENV === "production") {
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required in production environment");
  }
} else {
  // Default for development/test if not provided
  if (!jwtSecret) {
    console.warn("⚠️  JWT_SECRET not set, using default dev secret. Do not use in production!");
    jwtSecret = "seat-genie-dev-secret";
  }
}

// 数据库路径相对于 backend 目录（从 src/config 回退两级）
const backendDir = path.join(__dirname, "..", "..");
const config = {
  port: env.PORT,
  logLevel: env.LOG_LEVEL,
  databaseFile: path.resolve(backendDir, env.DATABASE_FILE),
  jwtSecret: jwtSecret,
  isProduction: env.NODE_ENV === "production",
};

module.exports = { config };
