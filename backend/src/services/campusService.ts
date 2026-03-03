import { getDb } from "../db";
import type { CampusRow, Campus, CreateCampus, UpdateCampus, ListResult } from "../types";

const mapCampus = (row: CampusRow | undefined): Campus | null =>
  row
    ? {
        id: row.id,
        name: row.name,
        address: row.address,
        description: row.description,
        activeStatus: row.active_status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    : null;

const listCampuses = ({ sortBy, sortOrder, limit, offset }: {
  sortBy?: string;
  sortOrder?: string;
  limit: number;
  offset: number;
}): ListResult<Campus> => {
  const db = getDb();
  const where = "WHERE active_status = 'Y'";

  const allowedSort = ["id", "name", "created_at"];
  const orderColumn = allowedSort.includes(sortBy as string) ? sortBy : "id";
  const orderDirection = sortOrder === "desc" ? "DESC" : "ASC";

  const { total } = db.prepare(`SELECT COUNT(*) as total FROM campuses ${where}`).get() as { total: number };
  const rows = db
    .prepare(`SELECT * FROM campuses ${where} ORDER BY ${orderColumn} ${orderDirection} LIMIT ? OFFSET ?`)
    .all(limit, offset) as CampusRow[];

  return { data: rows.map(mapCampus) as Campus[], meta: { total, limit, offset } };
};

const getCampusById = (id: number): Campus | null => {
  const db = getDb();
  const row = db.prepare("SELECT * FROM campuses WHERE id = ?").get(id) as CampusRow | undefined;
  return mapCampus(row);
};

const createCampus = (payload: CreateCampus): Campus | null => {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db
    .prepare(
      `INSERT INTO campuses (name, address, description, active_status, created_at, updated_at)
       VALUES (?, ?, ?, 'Y', ?, ?)`
    )
    .run(payload.name, payload.address || null, payload.description || null, now, now);
  return getCampusById(result.lastInsertRowid as number);
};

const updateCampus = (id: number, payload: UpdateCampus): Campus | null => {
  const db = getDb();
  const now = new Date().toISOString();
  const fields: string[] = [];
  const params: unknown[] = [];

  if (payload.name !== undefined) { fields.push("name = ?"); params.push(payload.name); }
  if (payload.address !== undefined) { fields.push("address = ?"); params.push(payload.address); }
  if (payload.description !== undefined) { fields.push("description = ?"); params.push(payload.description); }
  if (payload.activeStatus !== undefined) { fields.push("active_status = ?"); params.push(payload.activeStatus); }

  fields.push("updated_at = ?");
  params.push(now);
  params.push(id);

  db.prepare(`UPDATE campuses SET ${fields.join(", ")} WHERE id = ?`).run(...params);
  return getCampusById(id);
};

const deleteCampus = (id: number): boolean => {
  const db = getDb();
  db.prepare("UPDATE campuses SET active_status = 'N', updated_at = ? WHERE id = ?")
    .run(new Date().toISOString(), id);
  return true;
};

export { listCampuses, getCampusById, createCampus, updateCampus, deleteCampus };
