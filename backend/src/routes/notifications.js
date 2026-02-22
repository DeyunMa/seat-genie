const express = require("express");
const { z } = require("zod");
const notificationsService = require("../services/notificationsService");
const { buildListQuery } = require("../utils/params");
const { validate } = require("../middleware/validate");
const { NotFoundError } = require("../utils/errors");

const router = express.Router();

const listSchema = z.object({
  type: z.enum(["system", "announcement"]).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const notificationSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(["system", "announcement"]).optional().default("announcement"),
  createdBy: z.coerce.number().int().positive().optional().nullable(),
});

const updateNotificationSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  type: z.enum(["system", "announcement"]).optional(),
});

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const userIdSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

router.get("/", validate({ query: listSchema }), (req, res, next) => {
  try {
    const result = notificationsService.listNotifications(buildListQuery(req.query));
    res.json({ data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const notification = notificationsService.getNotificationById(req.params.id);
    if (!notification || notification.activeStatus !== "Y") {
      throw new NotFoundError("Notification not found");
    }
    res.json({ data: notification });
  } catch (err) {
    next(err);
  }
});

router.post("/", validate({ body: notificationSchema }), (req, res, next) => {
  try {
    const notification = notificationsService.createNotification(req.body);
    res.status(201).json({ data: notification });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validate({ params: idSchema, body: updateNotificationSchema }), (req, res, next) => {
  try {
    const existing = notificationsService.getNotificationById(req.params.id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("Notification not found");
    }
    const notification = notificationsService.updateNotification(req.params.id, req.body);
    res.json({ data: notification });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const existing = notificationsService.getNotificationById(req.params.id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("Notification not found");
    }
    notificationsService.deleteNotification(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Mark as read
router.post("/:id/read", validate({ params: idSchema, body: userIdSchema }), (req, res, next) => {
  try {
    notificationsService.markAsRead(req.params.id, req.body.userId);
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
});

// Get read status for multiple notifications
router.post("/read-status", validate({ body: z.object({ ids: z.array(z.number()), userId: z.number() }) }), (req, res, next) => {
  try {
    const status = notificationsService.getReadStatus(req.body.ids, req.body.userId);
    res.json({ data: status });
  } catch (err) {
    next(err);
  }
});

// Get unread count
router.get("/unread/count", validate({ query: z.object({ userId: z.coerce.number() }) }), (req, res, next) => {
  try {
    const count = notificationsService.getUnreadCount(req.query.userId);
    res.json({ data: { count } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
