const path = require("path");
const { z } = require("zod");
require("dotenv").config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_FILE: z.string().default("data/library.db"),
  LOG_LEVEL: z.string().default("info"),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

const env = envSchema.parse(process.env);

// Enforce JWT_SECRET in production
if (env.NODE_ENV === "production" && !env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET must be defined in production environment.");
}

// Default secret for non-production
const jwtSecret = env.JWT_SECRET || "seat-genie-dev-secret";

if (env.NODE_ENV === "development" && !env.JWT_SECRET) {
  console.warn("WARNING: Using default insecure JWT_SECRET. Do not use this in production.");
}

// 数据库路径相对于 backend 目录（从 src/config 回退两级）
const backendDir = path.join(__dirname, "..", "..");
const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  logLevel: env.LOG_LEVEL,
  databaseFile: path.resolve(backendDir, env.DATABASE_FILE),
  jwtSecret,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
};

module.exports = { config };
