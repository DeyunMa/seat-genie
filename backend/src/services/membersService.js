const { getDb } = require("../db");

const SORT_COLUMNS = {
  id: "id",
  name: "name",
  email: "email",
  created_at: "created_at",
};

const buildFilters = ({ q }) => {
  const clauses = [];
  const params = [];

  if (q) {
    clauses.push("(name LIKE ? OR email LIKE ? OR phone LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, params };
};

const listMembers = ({ limit, offset, filters, sort }) => {
  const db = getDb();
  const { where, params } = buildFilters(filters);
  const sortColumn = SORT_COLUMNS[sort.by] || SORT_COLUMNS.id;
  const sortOrder = sort.order === "asc" ? "ASC" : "DESC";

  return db
    .prepare(
      `SELECT id, name, email, phone, created_at
       FROM members
       ${where}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);
};

const countMembers = (filters) => {
  const db = getDb();
  const { where, params } = buildFilters(filters);
  const row = db
    .prepare(`SELECT COUNT(1) AS total FROM members ${where}`)
    .get(...params);
  return row?.total ?? 0;
};

const getMember = (id) => {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, name, email, phone, created_at
       FROM members
       WHERE id = ?`
    )
    .get(id);
  return row || null;
};

const createMember = ({ name, email, phone }) => {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO members (name, email, phone)
       VALUES (?, ?, ?)`
    )
    .run(name, email, phone);
  return getMember(result.lastInsertRowid);
};

const updateMember = (id, { name, email, phone }) => {
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE members
       SET name = ?, email = ?, phone = ?
       WHERE id = ?`
    )
    .run(name, email, phone, id);
  if (result.changes === 0) {
    return null;
  }
  return getMember(id);
};

const deleteMember = (id) => {
  const db = getDb();
  const activeLoans = db
    .prepare(
      `SELECT COUNT(1) AS total
       FROM loans
       WHERE member_id = ? AND returned_at IS NULL`
    )
    .get(id);
  if (activeLoans && activeLoans.total > 0) {
    return { deleted: false, reason: "active_loans" };
  }
  const result = db.prepare("DELETE FROM members WHERE id = ?").run(id);
  return { deleted: result.changes > 0, reason: null };
};

module.exports = {
  listMembers,
  countMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
};
