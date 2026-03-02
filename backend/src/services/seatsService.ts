import { getDb } from "../db";
import type { SeatRow, Seat, CreateSeat, UpdateSeat, ListResult } from "../types";

const mapSeat = (row: SeatRow | undefined): Seat | null =>
  row
    ? {
        id: row.id,
        roomId: row.room_id,
        seatNumber: row.seat_number,
        positionX: row.position_x ?? 0,
        positionY: row.position_y ?? 0,
        status: row.status,
        activeStatus: row.active_status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    : null;

const listSeats = ({ roomId, status, q, sortBy, sortOrder, limit, offset }: {
  roomId?: number;
  status?: string;
  q?: string;
  sortBy?: string;
  sortOrder?: string;
  limit: number;
  offset: number;
}): ListResult<Seat> => {
  const db = getDb();
  const conditions: string[] = ["active_status = 'Y'"];
  const params: unknown[] = [];

  if (roomId) {
    conditions.push("room_id = ?");
    params.push(roomId);
  }

  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  if (q) {
    conditions.push("seat_number LIKE ?");
    params.push(`%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSort = ["id", "seat_number", "status", "room_id", "created_at"];
  const orderColumn = allowedSort.includes(sortBy as string) ? sortBy : "id";
  const orderDirection = sortOrder === "desc" ? "DESC" : "ASC";

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM seats ${where}`);
  const { total } = countStmt.get(...params) as { total: number };

  const stmt = db.prepare(
    `SELECT * FROM seats ${where} ORDER BY ${orderColumn} ${orderDirection} LIMIT ? OFFSET ?`
  );
  const rows = stmt.all(...params, limit, offset) as SeatRow[];

  return { data: rows.map(mapSeat) as Seat[], meta: { total, limit, offset } };
};

const getSeatById = (id: number): Seat | null => {
  const db = getDb();
  const row = db.prepare("SELECT * FROM seats WHERE id = ?").get(id) as SeatRow | undefined;
  return mapSeat(row);
};

const createSeat = (payload: CreateSeat): Seat | null => {
  const db = getDb();
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `INSERT INTO seats (room_id, seat_number, position_x, position_y, status, active_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'Y', ?, ?)`
    )
    .run(
      payload.roomId,
      payload.seatNumber,
      payload.positionX ?? 0,
      payload.positionY ?? 0,
      payload.status || "available",
      now,
      now
    );

  return getSeatById(result.lastInsertRowid as number);
};

const updateSeat = (id: number, payload: UpdateSeat): Seat | null => {
  const db = getDb();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const params: unknown[] = [];

  if (payload.roomId !== undefined) {
    fields.push("room_id = ?");
    params.push(payload.roomId);
  }
  if (payload.seatNumber !== undefined) {
    fields.push("seat_number = ?");
    params.push(payload.seatNumber);
  }
  if (payload.positionX !== undefined) {
    fields.push("position_x = ?");
    params.push(payload.positionX);
  }
  if (payload.positionY !== undefined) {
    fields.push("position_y = ?");
    params.push(payload.positionY);
  }
  if (payload.status !== undefined) {
    fields.push("status = ?");
    params.push(payload.status);
  }
  if (payload.activeStatus !== undefined) {
    fields.push("active_status = ?");
    params.push(payload.activeStatus);
  }

  fields.push("updated_at = ?");
  params.push(now);
  params.push(id);

  db.prepare(`UPDATE seats SET ${fields.join(", ")} WHERE id = ?`).run(...params);

  return getSeatById(id);
};

const deleteSeat = (id: number): boolean => {
  const db = getDb();
  db.prepare("UPDATE seats SET active_status = 'N', updated_at = ? WHERE id = ?").run(
    new Date().toISOString(),
    id
  );
  return true;
};

const getSeatsByRoom = (roomId: number): (Seat | null)[] => {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM seats WHERE room_id = ? AND active_status = 'Y'")
    .all(roomId) as SeatRow[];
  return rows.map(mapSeat);
};

export {
  listSeats,
  getSeatById,
  createSeat,
  updateSeat,
  deleteSeat,
  getSeatsByRoom,
};
