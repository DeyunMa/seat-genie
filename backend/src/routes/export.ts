import { Router, Request, Response, NextFunction } from "express";
import express from "express";
import * as exportService from "../services/exportService";
import { BadRequestError } from "../utils/errors";

const router = Router();

router.get("/books", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const buffer = await exportService.exportBooksToExcel();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=books.xlsx");
    res.send(Buffer.from(buffer));
  } catch (err) {
    next(err);
  }
});

router.get("/users", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const buffer = await exportService.exportUsersToExcel();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");
    res.send(Buffer.from(buffer));
  } catch (err) {
    next(err);
  }
});

router.get("/reservations", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const buffer = await exportService.exportReservationsToExcel();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=reservations.xlsx");
    res.send(Buffer.from(buffer));
  } catch (err) {
    next(err);
  }
});

router.get("/loans", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const buffer = await exportService.exportLoansToExcel();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=loans.xlsx");
    res.send(Buffer.from(buffer));
  } catch (err) {
    next(err);
  }
});

router.post(
  "/books/import",
  express.raw({ type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", limit: "10mb" }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body || !Buffer.isBuffer(req.body) || req.body.length === 0) {
        throw new BadRequestError("Please upload a valid Excel file (.xlsx)");
      }
      const result = await exportService.importBooksFromExcel(req.body);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
