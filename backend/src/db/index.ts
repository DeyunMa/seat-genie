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

const hasColumn = (db: BetterSqlite3.Database, table: string, column: string): boolean => {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return cols.some((c) => c.name === column);
};

const migrateExistingDb = (db: BetterSqlite3.Database): void => {
  if (!hasColumn(db, "seats", "position_x")) {
    db.exec("ALTER TABLE seats ADD COLUMN position_x INTEGER NOT NULL DEFAULT 0");
    db.exec("ALTER TABLE seats ADD COLUMN position_y INTEGER NOT NULL DEFAULT 0");
    logger.info("Migration: added position_x/position_y to seats");
  }

  if (!hasColumn(db, "rooms", "campus_id")) {
    db.exec("ALTER TABLE rooms ADD COLUMN campus_id INTEGER REFERENCES campuses(id) ON DELETE SET NULL");
    logger.info("Migration: added campus_id to rooms");
  }

  if (!hasColumn(db, "users", "email_notifications")) {
    db.exec("ALTER TABLE users ADD COLUMN email_notifications TEXT NOT NULL DEFAULT 'N'");
    logger.info("Migration: added email_notifications to users");
  }

  const hasCampuses = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='campuses'").get();
  if (!hasCampuses) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS campuses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        address TEXT,
        description TEXT,
        active_status TEXT NOT NULL DEFAULT 'Y',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT
      )
    `);
    logger.info("Migration: created campuses table");
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
  } else {
    migrateExistingDb(db);
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
