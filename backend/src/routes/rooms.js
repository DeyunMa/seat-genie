const express = require("express");
const { z } = require("zod");
const roomsService = require("../services/roomsService");
const { buildListQuery } = require("../utils/params");
const { validate } = require("../middleware/validate");
const { NotFoundError } = require("../utils/errors");

const router = express.Router();

const listSchema = z.object({
  q: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const roomSchema = z.object({
  name: z.string().min(1),
  floor: z.coerce.number().int().optional().nullable(),
  capacity: z.coerce.number().int().min(0).optional().default(0),
  openTime: z.string().optional().nullable(),
  closeTime: z.string().optional().nullable(),
});

const updateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  floor: z.coerce.number().int().optional().nullable(),
  capacity: z.coerce.number().int().min(0).optional(),
  openTime: z.string().optional().nullable(),
  closeTime: z.string().optional().nullable(),
});

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

router.get("/", validate({ query: listSchema }), (req, res, next) => {
  try {
    const result = roomsService.listRooms(buildListQuery(req.query));
    res.json({ data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const room = roomsService.getRoomById(req.params.id);
    if (!room || room.activeStatus !== "Y") {
      throw new NotFoundError("Room not found");
    }
    res.json({ data: room });
  } catch (err) {
    next(err);
  }
});

router.post("/", validate({ body: roomSchema }), (req, res, next) => {
  try {
    const room = roomsService.createRoom(req.body);
    res.status(201).json({ data: room });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validate({ params: idSchema, body: updateRoomSchema }), (req, res, next) => {
  try {
    const existing = roomsService.getRoomById(req.params.id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("Room not found");
    }
    const room = roomsService.updateRoom(req.params.id, req.body);
    res.json({ data: room });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const existing = roomsService.getRoomById(req.params.id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("Room not found");
    }
    roomsService.deleteRoom(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
