const { getDb } = require("../db");

const SORT_COLUMNS = {
  id: "b.id",
  title: "b.title",
  author: "b.author",
  category: "b.category",
  published_year: "b.published_year",
  status: "b.status",
  active_status: "b.active_status",
  author_name: "b.author",
};

const buildFilters = ({
  status,
  authorId,
  author,
  title,
  isbn,
  publishedYear,
  category,
  activeStatus,
}) => {
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

  if (author) {
    clauses.push("b.author LIKE ?");
    params.push(`%${author}%`);
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

  if (category) {
    clauses.push("b.category = ?");
    params.push(category);
  }

  if (activeStatus) {
    clauses.push("b.active_status = ?");
    params.push(activeStatus);
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
      `SELECT b.id, b.title, b.isbn, b.author, b.publisher, b.category,
              b.location, b.published_year, b.status,
              b.active_status AS activeStatus,
              b.author_id AS authorId
       FROM books b
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
      `SELECT b.id, b.title, b.isbn, b.author, b.publisher, b.category,
              b.location, b.published_year, b.status,
              b.active_status AS activeStatus,
              b.author_id AS authorId
       FROM books b
       WHERE b.id = ?`
    )
    .get(id);
  return row || null;
};

const createBook = ({
  title,
  isbn,
  author,
  publisher,
  category,
  location,
  authorId,
  publishedYear,
  status,
  activeStatus,
}) => {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO books (
          title, isbn, author, publisher, category, location,
          author_id, published_year, status, active_status, updated_at
        )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      title,
      isbn,
      author,
      publisher,
      category,
      location,
      authorId ?? null,
      publishedYear ?? null,
      status,
      activeStatus,
      new Date().toISOString()
    );
  return getBook(result.lastInsertRowid);
};

const updateBook = (
  id,
  {
    title,
    isbn,
    author,
    publisher,
    category,
    location,
    authorId,
    publishedYear,
    status,
    activeStatus,
  }
) => {
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE books
       SET title = ?,
           isbn = ?,
           author = ?,
           publisher = ?,
           category = ?,
           location = ?,
           author_id = ?,
           published_year = ?,
           status = ?,
           active_status = ?,
           updated_at = ?
       WHERE id = ?`
    )
    .run(
      title,
      isbn,
      author,
      publisher,
      category,
      location,
      authorId ?? null,
      publishedYear ?? null,
      status,
      activeStatus,
      new Date().toISOString(),
      id
    );
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
