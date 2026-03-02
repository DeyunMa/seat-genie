import { getDb } from "../db";
import type { Author, CreateAuthor, UpdateAuthor } from "../types";

const SORT_COLUMNS: Record<string, string> = {
  id: "id",
  name: "name",
  created_at: "created_at",
};

interface AuthorFilters {
  q?: string;
}

const buildFilters = ({ q }: AuthorFilters): { where: string; params: unknown[] } => {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (q) {
    clauses.push("(name LIKE ? OR bio LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, params };
};

const listAuthors = ({ limit, offset, filters, sort }: {
  limit: number;
  offset: number;
  filters: AuthorFilters;
  sort: { by: string; order: string };
}): Author[] => {
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
    .all(...params, limit, offset) as Author[];
};

const countAuthors = (filters: AuthorFilters): number => {
  const db = getDb();
  const { where, params } = buildFilters(filters);
  const row = db
    .prepare(`SELECT COUNT(1) AS total FROM authors ${where}`)
    .get(...params) as { total: number } | undefined;
  return row?.total ?? 0;
};

const getAuthor = (id: number): Author | null => {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, name, bio, created_at
       FROM authors
       WHERE id = ?`
    )
    .get(id) as Author | undefined;
  return row || null;
};

const createAuthor = ({ name, bio }: CreateAuthor): Author | null => {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO authors (name, bio)
       VALUES (?, ?)`
    )
    .run(name, bio ?? null);
  return getAuthor(result.lastInsertRowid as number);
};

const updateAuthor = (id: number, { name, bio }: UpdateAuthor): Author | null => {
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

const deleteAuthor = (id: number): boolean => {
  const db = getDb();
  const result = db.prepare("DELETE FROM authors WHERE id = ?").run(id);
  return result.changes > 0;
};

export {
  listAuthors,
  countAuthors,
  getAuthor,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
