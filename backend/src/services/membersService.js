const { getDb } = require("../db");

const listMembers = () => {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, name, email, phone, created_at
       FROM members
       ORDER BY id DESC`
    )
    .all();
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
  getMember,
  createMember,
  updateMember,
  deleteMember,
};
