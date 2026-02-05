const { getDb } = require("../db");

const SORT_COLUMNS = {
  id: "id",
  name: "name",
  created_at: "created_at",
};

const buildFilters = ({ q }) => {
  const clauses = [];
  const params = [];

  if (q) {
    clauses.push("(name LIKE ? OR bio LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, params };
};

const listAuthors = ({ limit, offset, filters, sort }) => {
  const db = getDb();
  const { where, params } = buildFilters(filters);
  const sortColumn = SORT_COLUMNS[sort.by] || SORT_COLUMNS.id;
  const sortOrder = sort.order === "asc" ? "ASC" : "DESC";

  return db
    .prepare(
      `SELECT id, name, bio, created_at
       FROM authors
       ${where}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);
};

const countAuthors = (filters) => {
  const db = getDb();
  const { where, params } = buildFilters(filters);
  const row = db
    .prepare(`SELECT COUNT(1) AS total FROM authors ${where}`)
    .get(...params);
  return row?.total ?? 0;
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
  countAuthors,
  getAuthor,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
