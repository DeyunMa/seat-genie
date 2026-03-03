import { Router, Request, Response, NextFunction } from "express";
import * as schedulerService from "../services/schedulerService";

const router = Router();

router.post("/run", (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = schedulerService.runNow();
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
