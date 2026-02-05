const { getDb } = require("../db");

const SORT_COLUMNS = {
  id: "b.id",
  title: "b.title",
  published_year: "b.published_year",
  status: "b.status",
  author_name: "a.name",
};

const buildFilters = ({ status, authorId, title, isbn, publishedYear }) => {
  const clauses = [];
  const params = [];

  if (status) {
    clauses.push("b.status = ?");
    params.push(status);
  }

  if (authorId) {
    clauses.push("b.author_id = ?");
    params.push(authorId);
  }

  if (title) {
    clauses.push("b.title LIKE ?");
    params.push(`%${title}%`);
  }

  if (isbn) {
    clauses.push("b.isbn LIKE ?");
    params.push(`%${isbn}%`);
  }

  if (publishedYear !== undefined && publishedYear !== null) {
    clauses.push("b.published_year = ?");
    params.push(publishedYear);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, params };
};

const listBooks = ({ limit, offset, filters, sort }) => {
  const db = getDb();
  const { where, params } = buildFilters(filters);
  const sortColumn = SORT_COLUMNS[sort.by] || SORT_COLUMNS.id;
  const sortOrder = sort.order === "asc" ? "ASC" : "DESC";

  const rows = db
    .prepare(
      `SELECT b.id, b.title, b.isbn, b.published_year, b.status,
              a.id AS author_id, a.name AS author_name
       FROM books b
       LEFT JOIN authors a ON a.id = b.author_id
       ${where}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);
  return rows;
};

const countBooks = (filters) => {
  const db = getDb();
  const { where, params } = buildFilters(filters);
  const row = db
    .prepare(`SELECT COUNT(1) AS total FROM books b ${where}`)
    .get(...params);
  return row?.total ?? 0;
};

const getBook = (id) => {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT b.id, b.title, b.isbn, b.published_year, b.status,
              a.id AS author_id, a.name AS author_name
       FROM books b
       LEFT JOIN authors a ON a.id = b.author_id
       WHERE b.id = ?`
    )
    .get(id);
  return row || null;
};

const createBook = ({ title, isbn, authorId, publishedYear, status }) => {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO books (title, isbn, author_id, published_year, status)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(title, isbn, authorId, publishedYear, status);
  return getBook(result.lastInsertRowid);
};

const updateBook = (id, { title, isbn, authorId, publishedYear, status }) => {
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE books
       SET title = ?, isbn = ?, author_id = ?, published_year = ?, status = ?
       WHERE id = ?`
    )
    .run(title, isbn, authorId, publishedYear, status, id);
  if (result.changes === 0) {
    return null;
  }
  return getBook(id);
};

const deleteBook = (id) => {
  const db = getDb();
  const result = db.prepare("DELETE FROM books WHERE id = ?").run(id);
  return result.changes > 0;
};

module.exports = {
  listBooks,
  countBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
};
