const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const { config } = require("../config/env");
const { logger } = require("../logger");

let db;

const ensureDirectory = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const initDatabase = () => {
  const db = getDb();
  const isNewDb = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get() === undefined;
  
  if (isNewDb) {
    logger.info("Initializing database schema...");
    const backendDir = path.join(__dirname, "..", "..");
    
    // Execute schema
    const schemaPath = path.join(backendDir, "sql", "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf-8");
      db.exec(schema);
      logger.info("Database schema created successfully");
    }
    
    // Execute seed data
    const seedPath = path.join(backendDir, "sql", "seed.sql");
    if (fs.existsSync(seedPath)) {
      const seed = fs.readFileSync(seedPath, "utf-8");
      db.exec(seed);
      logger.info("Seed data inserted successfully");
    }
  }
};

const getDb = () => {
  if (!db) {
    ensureDirectory(config.databaseFile);
    db = new Database(config.databaseFile);
    db.pragma("foreign_keys = ON");
    initDatabase();
  }
  return db;
};

const closeDb = () => {
  if (db) {
    db.close();
    db = undefined;
  }
};

module.exports = { getDb, closeDb };
