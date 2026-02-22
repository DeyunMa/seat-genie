const { getDb } = require("../db");

const mapRoom = (row) =>
  row
    ? {
        id: row.id,
        name: row.name,
        floor: row.floor,
        capacity: row.capacity,
        openTime: row.open_time,
        closeTime: row.close_time,
        activeStatus: row.active_status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    : null;

const listRooms = ({ q, sortBy, sortOrder, limit, offset }) => {
  const db = getDb();
  const conditions = ["active_status = 'Y'"];
  const params = [];

  if (q) {
    conditions.push("name LIKE ?");
    params.push(`%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSort = ["id", "name", "floor", "capacity", "created_at"];
  const orderColumn = allowedSort.includes(sortBy) ? sortBy : "id";
  const orderDirection = sortOrder === "desc" ? "DESC" : "ASC";

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM rooms ${where}`);
  const { total } = countStmt.get(...params);

  const stmt = db.prepare(
    `SELECT * FROM rooms ${where} ORDER BY ${orderColumn} ${orderDirection} LIMIT ? OFFSET ?`
  );
  const rows = stmt.all(...params, limit, offset);

  return { data: rows.map(mapRoom), meta: { total, limit, offset } };
};

const getRoomById = (id) => {
  const db = getDb();
  const row = db.prepare("SELECT * FROM rooms WHERE id = ?").get(id);
  return mapRoom(row);
};

const createRoom = (payload) => {
  const db = getDb();
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `INSERT INTO rooms (name, floor, capacity, open_time, close_time, active_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'Y', ?, ?)`
    )
    .run(
      payload.name,
      payload.floor || null,
      payload.capacity || 0,
      payload.openTime || null,
      payload.closeTime || null,
      now,
      now
    );

  return getRoomById(result.lastInsertRowid);
};

const updateRoom = (id, payload) => {
  const db = getDb();
  const now = new Date().toISOString();

  const fields = [];
  const params = [];

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

const deleteRoom = (id) => {
  const db = getDb();
  db.prepare("UPDATE rooms SET active_status = 'N', updated_at = ? WHERE id = ?").run(
    new Date().toISOString(),
    id
  );
  return true;
};

module.exports = {
  listRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
