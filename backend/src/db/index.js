const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const { config } = require("../config/env");

let db;

const ensureDirectory = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const getDb = () => {
  if (!db) {
    ensureDirectory(config.databaseFile);
    db = new Database(config.databaseFile);
    db.pragma("foreign_keys = ON");
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
