const { getDb } = require("../db");

const listAuthors = () => {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, name, bio, created_at
       FROM authors
       ORDER BY id DESC`
    )
    .all();
};

const getAuthor = (id) => {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, name, bio, created_at
       FROM authors
       WHERE id = ?`
    )
    .get(id);
  return row || null;
};

const createAuthor = ({ name, bio }) => {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO authors (name, bio)
       VALUES (?, ?)`
    )
    .run(name, bio ?? null);
  return getAuthor(result.lastInsertRowid);
};

const updateAuthor = (id, { name, bio }) => {
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE authors
       SET name = ?, bio = ?
       WHERE id = ?`
    )
    .run(name, bio ?? null, id);
  if (result.changes === 0) {
    return null;
  }
  return getAuthor(id);
};

const deleteAuthor = (id) => {
  const db = getDb();
  const result = db.prepare("DELETE FROM authors WHERE id = ?").run(id);
  return result.changes > 0;
};

module.exports = {
  listAuthors,
  getAuthor,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
