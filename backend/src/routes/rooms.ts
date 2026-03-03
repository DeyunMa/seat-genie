import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as roomsService from "../services/roomsService";
import { buildListQuery } from "../utils/params";
import { validate } from "../middleware/validate";
import { authorize } from "../middleware/authorize";
import { NotFoundError } from "../utils/errors";

const router = Router();

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
  campusId: z.coerce.number().int().positive().optional().nullable(),
  openTime: z.string().optional().nullable(),
  closeTime: z.string().optional().nullable(),
});

const updateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  floor: z.coerce.number().int().optional().nullable(),
  capacity: z.coerce.number().int().min(0).optional(),
  campusId: z.coerce.number().int().positive().optional().nullable(),
  openTime: z.string().optional().nullable(),
  closeTime: z.string().optional().nullable(),
});

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

router.get("/", validate({ query: listSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = roomsService.listRooms(buildListQuery(req.query));
    res.json({ data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validate({ params: idSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = roomsService.getRoomById((req.params as any).id);
    if (!room || room.activeStatus !== "Y") {
      throw new NotFoundError("Room not found");
    }
    res.json({ data: room });
  } catch (err) {
    next(err);
  }
});

router.post("/", authorize("admin", "staff"), validate({ body: roomSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = roomsService.createRoom(req.body);
    res.status(201).json({ data: room });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", authorize("admin", "staff"), validate({ params: idSchema, body: updateRoomSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = roomsService.getRoomById((req.params as any).id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("Room not found");
    }
    const room = roomsService.updateRoom((req.params as any).id, req.body);
    res.json({ data: room });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authorize("admin", "staff"), validate({ params: idSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = roomsService.getRoomById((req.params as any).id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("Room not found");
    }
    roomsService.deleteRoom((req.params as any).id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
