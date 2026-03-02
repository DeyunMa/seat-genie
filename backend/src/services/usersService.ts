import { getDb } from "../db";
import bcrypt from "bcryptjs";
import type { UserRow, User, CreateUser, UpdateUser, ListResult, PaginationMeta } from "../types";

const BCRYPT_ROUNDS = 10;

const mapUser = (row: UserRow | undefined): User | null =>
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

const listUsers = ({ role, q, sortBy, sortOrder, limit, offset }: {
  role?: string;
  q?: string;
  sortBy?: string;
  sortOrder?: string;
  limit: number;
  offset: number;
}): ListResult<User> => {
  const db = getDb();
  const conditions: string[] = ["active_status = 'Y'"];
  const params: unknown[] = [];

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
  const orderColumn = allowedSort.includes(sortBy as string) ? sortBy : "id";
  const orderDirection = sortOrder === "desc" ? "DESC" : "ASC";

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM users ${where}`);
  const { total } = countStmt.get(...params) as { total: number };

  const stmt = db.prepare(
    `SELECT * FROM users ${where} ORDER BY ${orderColumn} ${orderDirection} LIMIT ? OFFSET ?`
  );
  const rows = stmt.all(...params, limit, offset) as UserRow[];

  return { data: rows.map(mapUser) as User[], meta: { total, limit, offset } };
};

const getUserById = (id: number): User | null => {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return mapUser(row);
};

const getUserByUsername = (username: string): User | null => {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM users WHERE username = ? AND active_status = 'Y'")
    .get(username) as UserRow | undefined;
  return mapUser(row);
};

const createUser = async (payload: CreateUser): Promise<User | null> => {
  const db = getDb();
  const now = new Date().toISOString();
  const hashedPassword = await bcrypt.hash(payload.password, BCRYPT_ROUNDS);

  const result = db
    .prepare(
      `INSERT INTO users (username, password, name, role, email, phone, student_id, active_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Y', ?, ?)`
    )
    .run(
      payload.username,
      hashedPassword,
      payload.name,
      payload.role,
      payload.email || null,
      payload.phone || null,
      payload.studentId || null,
      now,
      now
    );

  return getUserById(result.lastInsertRowid as number);
};

const updateUser = async (id: number, payload: UpdateUser): Promise<User | null> => {
  const db = getDb();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const params: unknown[] = [];

  if (payload.username !== undefined) {
    fields.push("username = ?");
    params.push(payload.username);
  }
  if (payload.password !== undefined) {
    fields.push("password = ?");
    params.push(await bcrypt.hash(payload.password, BCRYPT_ROUNDS));
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

const deleteUser = (id: number): boolean => {
  const db = getDb();
  db.prepare("UPDATE users SET active_status = 'N', updated_at = ? WHERE id = ?").run(
    new Date().toISOString(),
    id
  );
  return true;
};

export {
  listUsers,
  getUserById,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
};
