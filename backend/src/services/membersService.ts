import { getDb } from "../db";
import { NotFoundError, ConflictError } from "../utils/errors";
import type { Member, CreateMember, UpdateMember } from "../types";

const SORT_COLUMNS: Record<string, string> = {
  id: "id",
  name: "name",
  email: "email",
  created_at: "created_at",
};

interface MemberFilters {
  q?: string;
}

const buildFilters = ({ q }: MemberFilters): { where: string; params: unknown[] } => {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (q) {
    clauses.push("(name LIKE ? OR email LIKE ? OR phone LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, params };
};

const listMembers = ({ limit, offset, filters, sort }: {
  limit: number;
  offset: number;
  filters: MemberFilters;
  sort: { by: string; order: string };
}): Member[] => {
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
    .all(...params, limit, offset) as Member[];
};

const countMembers = (filters: MemberFilters): number => {
  const db = getDb();
  const { where, params } = buildFilters(filters);
  const row = db
    .prepare(`SELECT COUNT(1) AS total FROM members ${where}`)
    .get(...params) as { total: number } | undefined;
  return row?.total ?? 0;
};

const getMember = (id: number): Member | null => {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, name, email, phone, created_at
       FROM members
       WHERE id = ?`
    )
    .get(id) as Member | undefined;
  return row || null;
};

const createMember = ({ name, email, phone }: CreateMember): Member | null => {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO members (name, email, phone)
       VALUES (?, ?, ?)`
    )
    .run(name, email, phone);
  return getMember(result.lastInsertRowid as number);
};

const updateMember = (id: number, { name, email, phone }: UpdateMember): Member | null => {
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

const deleteMember = (id: number): void => {
  const db = getDb();
  const existing = getMember(id);
  if (!existing) {
    throw new NotFoundError("Member not found");
  }
  const activeLoans = db
    .prepare(
      `SELECT COUNT(1) AS total
       FROM loans
       WHERE member_id = ? AND returned_at IS NULL`
    )
    .get(id) as { total: number } | undefined;
  if (activeLoans && activeLoans.total > 0) {
    throw new ConflictError("Member has active loans");
  }
  db.prepare("DELETE FROM members WHERE id = ?").run(id);
};

export {
  listMembers,
  countMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
};
