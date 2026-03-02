import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as reservationsService from "../services/reservationsService";
import { buildListQuery } from "../utils/params";
import { validate } from "../middleware/validate";
import { NotFoundError } from "../utils/errors";

const router = Router();

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

router.get("/", validate({ query: listSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = reservationsService.listReservations(buildListQuery(req.query));
    res.json({ data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validate({ params: idSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const reservation = reservationsService.getReservationById((req.params as any).id);
    if (!reservation) {
      throw new NotFoundError("Reservation not found");
    }
    res.json({ data: reservation });
  } catch (err) {
    next(err);
  }
});

router.post("/", validate({ body: reservationSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const reservation = reservationsService.createReservation(req.body);
    res.status(201).json({ data: reservation });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validate({ params: idSchema, body: updateReservationSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = reservationsService.getReservationById((req.params as any).id);
    if (!existing) {
      throw new NotFoundError("Reservation not found");
    }
    const reservation = reservationsService.updateReservation((req.params as any).id, req.body);
    res.json({ data: reservation });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/cancel", validate({ params: idSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = reservationsService.getReservationById((req.params as any).id);
    if (!existing) {
      throw new NotFoundError("Reservation not found");
    }
    const reservation = reservationsService.cancelReservation((req.params as any).id);
    res.json({ data: reservation });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", validate({ params: idSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = reservationsService.getReservationById((req.params as any).id);
    if (!existing) {
      throw new NotFoundError("Reservation not found");
    }
    reservationsService.deleteReservation((req.params as any).id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
