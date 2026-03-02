import { getDb } from "../db";
import { NotFoundError, ConflictError } from "../utils/errors";
import type { ReservationRow, Reservation, CreateReservation, UpdateReservation, ListResult } from "../types";

const mapReservation = (row: ReservationRow | undefined): Reservation | null =>
  row
    ? {
        id: row.id,
        userId: row.user_id,
        seatId: row.seat_id,
        date: row.date,
        startTime: row.start_time,
        endTime: row.end_time,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    : null;

const checkConflict = (seatId: number, date: string, startTime: string, endTime: string, excludeId: number | null = null): boolean => {
  const db = getDb();
  let sql = `
    SELECT * FROM reservations 
    WHERE seat_id = ? AND date = ? AND status = 'active'
    AND (
      (? >= start_time AND ? < end_time) OR
      (? > start_time AND ? <= end_time) OR
      (? <= start_time AND ? >= end_time)
    )
  `;
  const params: unknown[] = [
    seatId,
    date,
    startTime,
    startTime,
    endTime,
    endTime,
    startTime,
    endTime,
  ];

  if (excludeId) {
    sql += " AND id != ?";
    params.push(excludeId);
  }

  const conflicts = db.prepare(sql).all(...params) as ReservationRow[];
  return conflicts.length > 0;
};

const listReservations = ({ userId, seatId, date, status, sortBy, sortOrder, limit, offset }: {
  userId?: number;
  seatId?: number;
  date?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  limit: number;
  offset: number;
}): ListResult<Reservation> => {
  const db = getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (userId) {
    conditions.push("user_id = ?");
    params.push(userId);
  }

  if (seatId) {
    conditions.push("seat_id = ?");
    params.push(seatId);
  }

  if (date) {
    conditions.push("date = ?");
    params.push(date);
  }

  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSort = ["id", "date", "start_time", "status", "created_at"];
  const orderColumn = allowedSort.includes(sortBy as string) ? sortBy : "id";
  const orderDirection = sortOrder === "desc" ? "DESC" : "ASC";

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM reservations ${where}`);
  const { total } = countStmt.get(...params) as { total: number };

  const stmt = db.prepare(
    `SELECT * FROM reservations ${where} ORDER BY ${orderColumn} ${orderDirection} LIMIT ? OFFSET ?`
  );
  const rows = stmt.all(...params, limit, offset) as ReservationRow[];

  return { data: rows.map(mapReservation) as Reservation[], meta: { total, limit, offset } };
};

const getReservationById = (id: number): Reservation | null => {
  const db = getDb();
  const row = db.prepare("SELECT * FROM reservations WHERE id = ?").get(id) as ReservationRow | undefined;
  return mapReservation(row);
};

const createReservation = (payload: CreateReservation): Reservation | null => {
  const db = getDb();
  
  if (checkConflict(payload.seatId, payload.date, payload.startTime, payload.endTime)) {
    throw new ConflictError("Time slot is already reserved");
  }

  const now = new Date().toISOString();

  const result = db
    .prepare(
      `INSERT INTO reservations (user_id, seat_id, date, start_time, end_time, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`
    )
    .run(
      payload.userId,
      payload.seatId,
      payload.date,
      payload.startTime,
      payload.endTime,
      now,
      now
    );

  return getReservationById(result.lastInsertRowid as number);
};

const updateReservation = (id: number, payload: UpdateReservation): Reservation | null => {
  const db = getDb();
  const existing = getReservationById(id);
  
  if (!existing) {
    throw new NotFoundError("Reservation not found");
  }

  const seatId = payload.seatId !== undefined ? payload.seatId : existing.seatId;
  const date = payload.date !== undefined ? payload.date : existing.date;
  const startTime = payload.startTime !== undefined ? payload.startTime : existing.startTime;
  const endTime = payload.endTime !== undefined ? payload.endTime : existing.endTime;

  if (checkConflict(seatId, date, startTime, endTime, id)) {
    throw new ConflictError("Time slot is already reserved");
  }

  const now = new Date().toISOString();

  const fields: string[] = [];
  const params: unknown[] = [];

  if (payload.userId !== undefined) {
    fields.push("user_id = ?");
    params.push(payload.userId);
  }
  if (payload.seatId !== undefined) {
    fields.push("seat_id = ?");
    params.push(payload.seatId);
  }
  if (payload.date !== undefined) {
    fields.push("date = ?");
    params.push(payload.date);
  }
  if (payload.startTime !== undefined) {
    fields.push("start_time = ?");
    params.push(payload.startTime);
  }
  if (payload.endTime !== undefined) {
    fields.push("end_time = ?");
    params.push(payload.endTime);
  }
  if (payload.status !== undefined) {
    fields.push("status = ?");
    params.push(payload.status);
  }

  fields.push("updated_at = ?");
  params.push(now);
  params.push(id);

  db.prepare(`UPDATE reservations SET ${fields.join(", ")} WHERE id = ?`).run(...params);

  return getReservationById(id);
};

const cancelReservation = (id: number): Reservation | null => {
  return updateReservation(id, { status: "cancelled" });
};

const deleteReservation = (id: number): boolean => {
  const db = getDb();
  db.prepare("DELETE FROM reservations WHERE id = ?").run(id);
  return true;
};

export {
  listReservations,
  getReservationById,
  createReservation,
  updateReservation,
  cancelReservation,
  deleteReservation,
  checkConflict,
};
