import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import type BetterSqlite3 from "better-sqlite3";
import { config } from "../config/env";
import { logger } from "../logger";

let db: BetterSqlite3.Database | undefined;

const ensureDirectory = (filePath: string): void => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const initDatabase = (): void => {
  const db = getDb();
  const isNewDb =
    db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get() === undefined;

  if (isNewDb) {
    logger.info("Initializing database schema...");
    const backendDir = path.join(__dirname, "..", "..");

    const schemaPath = path.join(backendDir, "sql", "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf-8");
      db.exec(schema);
      logger.info("Database schema created successfully");
    }

    const seedPath = path.join(backendDir, "sql", "seed.sql");
    if (fs.existsSync(seedPath)) {
      const seed = fs.readFileSync(seedPath, "utf-8");
      db.exec(seed);
      logger.info("Seed data inserted successfully");
    }
  }
};

const getDb = (): BetterSqlite3.Database => {
  if (!db) {
    ensureDirectory(config.databaseFile);
    db = new Database(config.databaseFile);
    db.pragma("foreign_keys = ON");
    initDatabase();
  }
  return db;
};

const closeDb = (): void => {
  if (db) {
    db.close();
    db = undefined;
  }
};

export { getDb, closeDb };
