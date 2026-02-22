const { getDb } = require("../db");

const mapUser = (row) =>
  row
    ? {
        id: row.id,
        username: row.username,
        password: row.password,
        name: row.name,
        role: row.role,
        email: row.email,
        phone: row.phone,
        studentId: row.student_id,
        activeStatus: row.active_status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    : null;

const listUsers = ({ role, q, sortBy, sortOrder, limit, offset }) => {
  const db = getDb();
  const conditions = ["active_status = 'Y'"];
  const params = [];

  if (role) {
    conditions.push("role = ?");
    params.push(role);
  }

  if (q) {
    conditions.push(
      "(username LIKE ? OR name LIKE ? OR email LIKE ? OR phone LIKE ?)"
    );
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSort = [
    "id",
    "username",
    "name",
    "role",
    "email",
    "created_at",
  ];
  const orderColumn = allowedSort.includes(sortBy) ? sortBy : "id";
  const orderDirection = sortOrder === "desc" ? "DESC" : "ASC";

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM users ${where}`);
  const { total } = countStmt.get(...params);

  const stmt = db.prepare(
    `SELECT * FROM users ${where} ORDER BY ${orderColumn} ${orderDirection} LIMIT ? OFFSET ?`
  );
  const rows = stmt.all(...params, limit, offset);

  return { data: rows.map(mapUser), meta: { total, limit, offset } };
};

const getUserById = (id) => {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  return mapUser(row);
};

const getUserByUsername = (username) => {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM users WHERE username = ? AND active_status = 'Y'")
    .get(username);
  return mapUser(row);
};

const createUser = (payload) => {
  const db = getDb();
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `INSERT INTO users (username, password, name, role, email, phone, student_id, active_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Y', ?, ?)`
    )
    .run(
      payload.username,
      payload.password,
      payload.name,
      payload.role,
      payload.email || null,
      payload.phone || null,
      payload.studentId || null,
      now,
      now
    );

  return getUserById(result.lastInsertRowid);
};

const updateUser = (id, payload) => {
  const db = getDb();
  const now = new Date().toISOString();

  const fields = [];
  const params = [];

  if (payload.username !== undefined) {
    fields.push("username = ?");
    params.push(payload.username);
  }
  if (payload.password !== undefined) {
    fields.push("password = ?");
    params.push(payload.password);
  }
  if (payload.name !== undefined) {
    fields.push("name = ?");
    params.push(payload.name);
  }
  if (payload.role !== undefined) {
    fields.push("role = ?");
    params.push(payload.role);
  }
  if (payload.email !== undefined) {
    fields.push("email = ?");
    params.push(payload.email);
  }
  if (payload.phone !== undefined) {
    fields.push("phone = ?");
    params.push(payload.phone);
  }
  if (payload.studentId !== undefined) {
    fields.push("student_id = ?");
    params.push(payload.studentId);
  }
  if (payload.activeStatus !== undefined) {
    fields.push("active_status = ?");
    params.push(payload.activeStatus);
  }

  fields.push("updated_at = ?");
  params.push(now);
  params.push(id);

  db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(...params);

  return getUserById(id);
};

const deleteUser = (id) => {
  const db = getDb();
  db.prepare("UPDATE users SET active_status = 'N', updated_at = ? WHERE id = ?").run(
    new Date().toISOString(),
    id
  );
  return true;
};

module.exports = {
  listUsers,
  getUserById,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
};
