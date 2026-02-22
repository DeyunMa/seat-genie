const { getDb } = require("../db");

const mapNotification = (row) =>
  row
    ? {
        id: row.id,
        title: row.title,
        content: row.content,
        type: row.type,
        createdBy: row.created_by,
        activeStatus: row.active_status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    : null;

const listNotifications = ({ type, sortBy, sortOrder, limit, offset }) => {
  const db = getDb();
  const conditions = ["active_status = 'Y'"];
  const params = [];

  if (type) {
    conditions.push("type = ?");
    params.push(type);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSort = ["id", "type", "created_at"];
  const orderColumn = allowedSort.includes(sortBy) ? sortBy : "created_at";
  const orderDirection = sortOrder === "asc" ? "ASC" : "DESC";

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM notifications ${where}`);
  const { total } = countStmt.get(...params);

  const stmt = db.prepare(
    `SELECT * FROM notifications ${where} ORDER BY ${orderColumn} ${orderDirection} LIMIT ? OFFSET ?`
  );
  const rows = stmt.all(...params, limit, offset);

  return { data: rows.map(mapNotification), meta: { total, limit, offset } };
};

const getNotificationById = (id) => {
  const db = getDb();
  const row = db.prepare("SELECT * FROM notifications WHERE id = ?").get(id);
  return mapNotification(row);
};

const createNotification = (payload) => {
  const db = getDb();
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `INSERT INTO notifications (title, content, type, created_by, active_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'Y', ?, ?)`
    )
    .run(
      payload.title,
      payload.content,
      payload.type || "announcement",
      payload.createdBy || null,
      now,
      now
    );

  return getNotificationById(result.lastInsertRowid);
};

const updateNotification = (id, payload) => {
  const db = getDb();
  const now = new Date().toISOString();

  const fields = [];
  const params = [];

  if (payload.title !== undefined) {
    fields.push("title = ?");
    params.push(payload.title);
  }
  if (payload.content !== undefined) {
    fields.push("content = ?");
    params.push(payload.content);
  }
  if (payload.type !== undefined) {
    fields.push("type = ?");
    params.push(payload.type);
  }
  if (payload.activeStatus !== undefined) {
    fields.push("active_status = ?");
    params.push(payload.activeStatus);
  }

  fields.push("updated_at = ?");
  params.push(now);
  params.push(id);

  db.prepare(`UPDATE notifications SET ${fields.join(", ")} WHERE id = ?`).run(...params);

  return getNotificationById(id);
};

const deleteNotification = (id) => {
  const db = getDb();
  db.prepare("UPDATE notifications SET active_status = 'N', updated_at = ? WHERE id = ?").run(
    new Date().toISOString(),
    id
  );
  return true;
};

// Notification reads
const markAsRead = (notificationId, userId) => {
  const db = getDb();
  const now = new Date().toISOString();

  try {
    db.prepare(
      `INSERT INTO notification_reads (notification_id, user_id, read_at) VALUES (?, ?, ?)`
    ).run(notificationId, userId, now);
  } catch (err) {
    // Already read, ignore
  }
  return true;
};

const getReadStatus = (notificationIds, userId) => {
  const db = getDb();
  if (!notificationIds.length) return {};

  const placeholders = notificationIds.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT notification_id FROM notification_reads WHERE notification_id IN (${placeholders}) AND user_id = ?`
    )
    .all(...notificationIds, userId);

  const readSet = new Set(rows.map((r) => r.notification_id));
  const result = {};
  notificationIds.forEach((id) => {
    result[id] = readSet.has(id);
  });
  return result;
};

const getUnreadCount = (userId) => {
  const db = getDb();
  const { count } = db
    .prepare(
      `SELECT COUNT(*) as count FROM notifications n
       WHERE n.active_status = 'Y'
       AND NOT EXISTS (
         SELECT 1 FROM notification_reads nr 
         WHERE nr.notification_id = n.id AND nr.user_id = ?
       )`
    )
    .get(userId);
  return count;
};

module.exports = {
  listNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  getReadStatus,
  getUnreadCount,
};
