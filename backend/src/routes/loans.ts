import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as loansService from "../services/loansService";
import { validate } from "../middleware/validate";
import { NotFoundError } from "../utils/errors";

const router = Router();

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const loanCreateSchema = z
  .object({
    bookId: z.coerce.number().int().positive(),
    memberId: z.coerce.number().int().positive(),
    dueAt: z.string().datetime(),
  })
  .strict();

const loanUpdateSchema = z
  .object({
    dueAt: z.string().datetime().optional(),
    returnedAt: z.string().datetime().optional(),
  })
  .strict()
  .refine((data) => data.dueAt || data.returnedAt, {
    message: "Provide dueAt or returnedAt",
  });

const listQuerySchema = z.object({
  status: z.enum(["open", "returned"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

router.get("/", validate({ query: listQuerySchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset, status } = req.query as any;
    const loans = loansService.listLoans({ limit, offset, status });
    const total = loansService.countLoans(status);
    res.json({
      data: loans,
      meta: { total, limit, offset, status: status ?? null },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validate({ params: idSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const loan = loansService.getLoan((req.params as any).id);
    if (!loan) {
      throw new NotFoundError("Loan not found");
    }
    res.json({ data: loan });
  } catch (err) {
    next(err);
  }
});

router.post("/", validate({ body: loanCreateSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const loan = loansService.createLoan(req.body);
    res.status(201).json({ data: loan });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validate({ params: idSchema, body: loanUpdateSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const loan = loansService.updateLoan((req.params as any).id, req.body);
    res.json({ data: loan });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", validate({ params: idSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    loansService.deleteLoan((req.params as any).id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
