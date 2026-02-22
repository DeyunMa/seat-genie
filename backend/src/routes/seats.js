const express = require("express");
const { z } = require("zod");
const seatsService = require("../services/seatsService");
const { buildListQuery } = require("../utils/params");
const { validate } = require("../middleware/validate");
const { NotFoundError } = require("../utils/errors");

const router = express.Router();

const listSchema = z.object({
  roomId: z.coerce.number().int().positive().optional(),
  status: z.enum(["available", "occupied", "maintenance"]).optional(),
  q: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const seatSchema = z.object({
  roomId: z.coerce.number().int().positive(),
  seatNumber: z.string().min(1),
  status: z.enum(["available", "occupied", "maintenance"]).optional().default("available"),
});

const updateSeatSchema = z.object({
  roomId: z.coerce.number().int().positive().optional(),
  seatNumber: z.string().min(1).optional(),
  status: z.enum(["available", "occupied", "maintenance"]).optional(),
});

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

router.get("/", validate({ query: listSchema }), (req, res, next) => {
  try {
    const result = seatsService.listSeats(buildListQuery(req.query));
    res.json({ data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const seat = seatsService.getSeatById(req.params.id);
    if (!seat || seat.activeStatus !== "Y") {
      throw new NotFoundError("Seat not found");
    }
    res.json({ data: seat });
  } catch (err) {
    next(err);
  }
});

router.post("/", validate({ body: seatSchema }), (req, res, next) => {
  try {
    const seat = seatsService.createSeat(req.body);
    res.status(201).json({ data: seat });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validate({ params: idSchema, body: updateSeatSchema }), (req, res, next) => {
  try {
    const existing = seatsService.getSeatById(req.params.id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("Seat not found");
    }
    const seat = seatsService.updateSeat(req.params.id, req.body);
    res.json({ data: seat });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const existing = seatsService.getSeatById(req.params.id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("Seat not found");
    }
    seatsService.deleteSeat(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
