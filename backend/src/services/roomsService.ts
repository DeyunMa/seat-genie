import { getDb } from "../db";
import type { RoomRow, Room, CreateRoom, UpdateRoom, ListResult } from "../types";

const mapRoom = (row: RoomRow | undefined): Room | null =>
  row
    ? {
        id: row.id,
        name: row.name,
        floor: row.floor,
        capacity: row.capacity,
        openTime: row.open_time,
        closeTime: row.close_time,
        campusId: row.campus_id ?? null,
        activeStatus: row.active_status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    : null;

const listRooms = ({ q, sortBy, sortOrder, limit, offset }: {
  q?: string;
  sortBy?: string;
  sortOrder?: string;
  limit: number;
  offset: number;
}): ListResult<Room> => {
  const db = getDb();
  const conditions: string[] = ["active_status = 'Y'"];
  const params: unknown[] = [];

  if (q) {
    conditions.push("name LIKE ?");
    params.push(`%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSort = ["id", "name", "floor", "capacity", "created_at"];
  const orderColumn = allowedSort.includes(sortBy as string) ? sortBy : "id";
  const orderDirection = sortOrder === "desc" ? "DESC" : "ASC";

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM rooms ${where}`);
  const { total } = countStmt.get(...params) as { total: number };

  const stmt = db.prepare(
    `SELECT * FROM rooms ${where} ORDER BY ${orderColumn} ${orderDirection} LIMIT ? OFFSET ?`
  );
  const rows = stmt.all(...params, limit, offset) as RoomRow[];

  return { data: rows.map(mapRoom) as Room[], meta: { total, limit, offset } };
};

const getRoomById = (id: number): Room | null => {
  const db = getDb();
  const row = db.prepare("SELECT * FROM rooms WHERE id = ?").get(id) as RoomRow | undefined;
  return mapRoom(row);
};

const createRoom = (payload: CreateRoom): Room | null => {
  const db = getDb();
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `INSERT INTO rooms (name, floor, capacity, open_time, close_time, campus_id, active_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Y', ?, ?)`
    )
    .run(
      payload.name,
      payload.floor || null,
      payload.capacity || 0,
      payload.openTime || null,
      payload.closeTime || null,
      payload.campusId || null,
      now,
      now
    );

  return getRoomById(result.lastInsertRowid as number);
};

const updateRoom = (id: number, payload: UpdateRoom): Room | null => {
  const db = getDb();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const params: unknown[] = [];

  if (payload.name !== undefined) {
    fields.push("name = ?");
    params.push(payload.name);
  }
  if (payload.floor !== undefined) {
    fields.push("floor = ?");
    params.push(payload.floor);
  }
  if (payload.capacity !== undefined) {
    fields.push("capacity = ?");
    params.push(payload.capacity);
  }
  if (payload.openTime !== undefined) {
    fields.push("open_time = ?");
    params.push(payload.openTime);
  }
  if (payload.closeTime !== undefined) {
    fields.push("close_time = ?");
    params.push(payload.closeTime);
  }
  if (payload.campusId !== undefined) {
    fields.push("campus_id = ?");
    params.push(payload.campusId);
  }
  if (payload.activeStatus !== undefined) {
    fields.push("active_status = ?");
    params.push(payload.activeStatus);
  }

  fields.push("updated_at = ?");
  params.push(now);
  params.push(id);

  db.prepare(`UPDATE rooms SET ${fields.join(", ")} WHERE id = ?`).run(...params);

  return getRoomById(id);
};

const deleteRoom = (id: number): boolean => {
  const db = getDb();
  db.prepare("UPDATE rooms SET active_status = 'N', updated_at = ? WHERE id = ?").run(
    new Date().toISOString(),
    id
  );
  return true;
};

export {
  listRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
