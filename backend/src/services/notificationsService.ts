import { getDb } from "../db";
import type { NotificationRow, Notification, CreateNotification, UpdateNotification, ListResult } from "../types";

const mapNotification = (row: NotificationRow | undefined): Notification | null =>
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

const listNotifications = ({ type, sortBy, sortOrder, limit, offset }: {
  type?: string;
  sortBy?: string;
  sortOrder?: string;
  limit: number;
  offset: number;
}): ListResult<Notification> => {
  const db = getDb();
  const conditions: string[] = ["active_status = 'Y'"];
  const params: unknown[] = [];

  if (type) {
    conditions.push("type = ?");
    params.push(type);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSort = ["id", "type", "created_at"];
  const orderColumn = allowedSort.includes(sortBy as string) ? sortBy : "created_at";
  const orderDirection = sortOrder === "asc" ? "ASC" : "DESC";

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM notifications ${where}`);
  const { total } = countStmt.get(...params) as { total: number };

  const stmt = db.prepare(
    `SELECT * FROM notifications ${where} ORDER BY ${orderColumn} ${orderDirection} LIMIT ? OFFSET ?`
  );
  const rows = stmt.all(...params, limit, offset) as NotificationRow[];

  return { data: rows.map(mapNotification) as Notification[], meta: { total, limit, offset } };
};

const getNotificationById = (id: number): Notification | null => {
  const db = getDb();
  const row = db.prepare("SELECT * FROM notifications WHERE id = ?").get(id) as NotificationRow | undefined;
  return mapNotification(row);
};

const createNotification = (payload: CreateNotification): Notification | null => {
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

  return getNotificationById(result.lastInsertRowid as number);
};

const updateNotification = (id: number, payload: UpdateNotification): Notification | null => {
  const db = getDb();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const params: unknown[] = [];

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

const deleteNotification = (id: number): boolean => {
  const db = getDb();
  db.prepare("UPDATE notifications SET active_status = 'N', updated_at = ? WHERE id = ?").run(
    new Date().toISOString(),
    id
  );
  return true;
};

const markAsRead = (notificationId: number, userId: number): boolean => {
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

const getReadStatus = (notificationIds: number[], userId: number): Record<number, boolean> => {
  const db = getDb();
  if (!notificationIds.length) return {};

  const placeholders = notificationIds.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT notification_id FROM notification_reads WHERE notification_id IN (${placeholders}) AND user_id = ?`
    )
    .all(...notificationIds, userId) as { notification_id: number }[];

  const readSet = new Set(rows.map((r) => r.notification_id));
  const result: Record<number, boolean> = {};
  notificationIds.forEach((id) => {
    result[id] = readSet.has(id);
  });
  return result;
};

const getUnreadCount = (userId: number): number => {
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
    .get(userId) as { count: number };
  return count;
};

export {
  listNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  getReadStatus,
  getUnreadCount,
};
