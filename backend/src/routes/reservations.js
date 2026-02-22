const express = require("express");
const { z } = require("zod");
const reservationsService = require("../services/reservationsService");
const { buildListQuery } = require("../utils/params");
const { validate } = require("../middleware/validate");
const { NotFoundError, ConflictError } = require("../utils/errors");

const router = express.Router();

const listSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  seatId: z.coerce.number().int().positive().optional(),
  date: z.string().optional(),
  status: z.enum(["active", "cancelled", "completed"]).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const reservationSchema = z.object({
  userId: z.coerce.number().int().positive(),
  seatId: z.coerce.number().int().positive(),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

const updateReservationSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  seatId: z.coerce.number().int().positive().optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(["active", "cancelled", "completed"]).optional(),
});

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

router.get("/", validate({ query: listSchema }), (req, res, next) => {
  try {
    const result = reservationsService.listReservations(buildListQuery(req.query));
    res.json({ data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const reservation = reservationsService.getReservationById(req.params.id);
    if (!reservation) {
      throw new NotFoundError("Reservation not found");
    }
    res.json({ data: reservation });
  } catch (err) {
    next(err);
  }
});

router.post("/", validate({ body: reservationSchema }), (req, res, next) => {
  try {
    const reservation = reservationsService.createReservation(req.body);
    res.status(201).json({ data: reservation });
  } catch (err) {
    if (err.message === "Time slot conflict") {
      return next(new ConflictError("Time slot is already reserved"));
    }
    next(err);
  }
});

router.put("/:id", validate({ params: idSchema, body: updateReservationSchema }), (req, res, next) => {
  try {
    const existing = reservationsService.getReservationById(req.params.id);
    if (!existing) {
      throw new NotFoundError("Reservation not found");
    }
    const reservation = reservationsService.updateReservation(req.params.id, req.body);
    res.json({ data: reservation });
  } catch (err) {
    if (err.message === "Time slot conflict") {
      return next(new ConflictError("Time slot is already reserved"));
    }
    next(err);
  }
});

router.post("/:id/cancel", validate({ params: idSchema }), (req, res, next) => {
  try {
    const existing = reservationsService.getReservationById(req.params.id);
    if (!existing) {
      throw new NotFoundError("Reservation not found");
    }
    const reservation = reservationsService.cancelReservation(req.params.id);
    res.json({ data: reservation });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const existing = reservationsService.getReservationById(req.params.id);
    if (!existing) {
      throw new NotFoundError("Reservation not found");
    }
    reservationsService.deleteReservation(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
