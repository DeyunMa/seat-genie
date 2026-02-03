const { getDb } = require("../db");

const listBooks = () => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT b.id, b.title, b.isbn, b.published_year, b.status,
              a.id AS author_id, a.name AS author_name
       FROM books b
       LEFT JOIN authors a ON a.id = b.author_id
       ORDER BY b.id DESC`
    )
    .all();
  return rows;
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
  getBook,
  createBook,
  updateBook,
  deleteBook,
};
