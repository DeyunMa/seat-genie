import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as campusService from "../services/campusService";
import { validate } from "../middleware/validate";
import { NotFoundError } from "../utils/errors";

const router = Router();

const listSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const campusSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

router.get("/", validate({ query: listSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset, sortBy, sortOrder } = req.query as any;
    const result = campusService.listCampuses({ sortBy, sortOrder, limit, offset });
    res.json({ data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validate({ params: idSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const campus = campusService.getCampusById((req.params as any).id);
    if (!campus || campus.activeStatus !== "Y") {
      throw new NotFoundError("Campus not found");
    }
    res.json({ data: campus });
  } catch (err) {
    next(err);
  }
});

router.post("/", validate({ body: campusSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const campus = campusService.createCampus(req.body);
    res.status(201).json({ data: campus });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validate({ params: idSchema, body: updateSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = campusService.getCampusById((req.params as any).id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("Campus not found");
    }
    const campus = campusService.updateCampus((req.params as any).id, req.body);
    res.json({ data: campus });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", validate({ params: idSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = campusService.getCampusById((req.params as any).id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("Campus not found");
    }
    campusService.deleteCampus((req.params as any).id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
