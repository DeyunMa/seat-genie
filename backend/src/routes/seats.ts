import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as seatsService from "../services/seatsService";
import { buildListQuery } from "../utils/params";
import { validate } from "../middleware/validate";
import { authorize } from "../middleware/authorize";
import { NotFoundError } from "../utils/errors";

const router = Router();

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
  positionX: z.coerce.number().int().min(0).optional().default(0),
  positionY: z.coerce.number().int().min(0).optional().default(0),
  status: z.enum(["available", "occupied", "maintenance"]).optional().default("available"),
});

const updateSeatSchema = z.object({
  roomId: z.coerce.number().int().positive().optional(),
  seatNumber: z.string().min(1).optional(),
  positionX: z.coerce.number().int().min(0).optional(),
  positionY: z.coerce.number().int().min(0).optional(),
  status: z.enum(["available", "occupied", "maintenance"]).optional(),
});

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

router.get("/", validate({ query: listSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = seatsService.listSeats(buildListQuery(req.query));
    res.json({ data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validate({ params: idSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const seat = seatsService.getSeatById((req.params as any).id);
    if (!seat || seat.activeStatus !== "Y") {
      throw new NotFoundError("Seat not found");
    }
    res.json({ data: seat });
  } catch (err) {
    next(err);
  }
});

router.post("/", authorize("admin", "staff"), validate({ body: seatSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const seat = seatsService.createSeat(req.body);
    res.status(201).json({ data: seat });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", authorize("admin", "staff"), validate({ params: idSchema, body: updateSeatSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = seatsService.getSeatById((req.params as any).id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("Seat not found");
    }
    const seat = seatsService.updateSeat((req.params as any).id, req.body);
    res.json({ data: seat });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authorize("admin", "staff"), validate({ params: idSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = seatsService.getSeatById((req.params as any).id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("Seat not found");
    }
    seatsService.deleteSeat((req.params as any).id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
