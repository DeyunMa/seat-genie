const { getDb } = require("../db");

const mapSeat = (row) =>
  row
    ? {
        id: row.id,
        roomId: row.room_id,
        seatNumber: row.seat_number,
        status: row.status,
        activeStatus: row.active_status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    : null;

const listSeats = ({ roomId, status, q, sortBy, sortOrder, limit, offset }) => {
  const db = getDb();
  const conditions = ["active_status = 'Y'"];
  const params = [];

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
  const orderColumn = allowedSort.includes(sortBy) ? sortBy : "id";
  const orderDirection = sortOrder === "desc" ? "DESC" : "ASC";

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM seats ${where}`);
  const { total } = countStmt.get(...params);

  const stmt = db.prepare(
    `SELECT * FROM seats ${where} ORDER BY ${orderColumn} ${orderDirection} LIMIT ? OFFSET ?`
  );
  const rows = stmt.all(...params, limit, offset);

  return { data: rows.map(mapSeat), meta: { total, limit, offset } };
};

const getSeatById = (id) => {
  const db = getDb();
  const row = db.prepare("SELECT * FROM seats WHERE id = ?").get(id);
  return mapSeat(row);
};

const createSeat = (payload) => {
  const db = getDb();
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `INSERT INTO seats (room_id, seat_number, status, active_status, created_at, updated_at)
       VALUES (?, ?, ?, 'Y', ?, ?)`
    )
    .run(
      payload.roomId,
      payload.seatNumber,
      payload.status || "available",
      now,
      now
    );

  return getSeatById(result.lastInsertRowid);
};

const updateSeat = (id, payload) => {
  const db = getDb();
  const now = new Date().toISOString();

  const fields = [];
  const params = [];

  if (payload.roomId !== undefined) {
    fields.push("room_id = ?");
    params.push(payload.roomId);
  }
  if (payload.seatNumber !== undefined) {
    fields.push("seat_number = ?");
    params.push(payload.seatNumber);
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

const deleteSeat = (id) => {
  const db = getDb();
  db.prepare("UPDATE seats SET active_status = 'N', updated_at = ? WHERE id = ?").run(
    new Date().toISOString(),
    id
  );
  return true;
};

const getSeatsByRoom = (roomId) => {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM seats WHERE room_id = ? AND active_status = 'Y'")
    .all(roomId);
  return rows.map(mapSeat);
};

module.exports = {
  listSeats,
  getSeatById,
  createSeat,
  updateSeat,
  deleteSeat,
  getSeatsByRoom,
};
