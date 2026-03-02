const express = require("express");
const { z } = require("zod");
const loansService = require("../services/loansService");
const { validate } = require("../middleware/validate");
const { NotFoundError } = require("../utils/errors");

const router = express.Router();

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

router.get("/", validate({ query: listQuerySchema }), (req, res, next) => {
  try {
    const { limit, offset, status } = req.query;
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

router.get("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const loan = loansService.getLoan(req.params.id);
    if (!loan) {
      throw new NotFoundError("Loan not found");
    }
    res.json({ data: loan });
  } catch (err) {
    next(err);
  }
});

router.post("/", validate({ body: loanCreateSchema }), (req, res, next) => {
  try {
    const loan = loansService.createLoan(req.body);
    res.status(201).json({ data: loan });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validate({ params: idSchema, body: loanUpdateSchema }), (req, res, next) => {
  try {
    const loan = loansService.updateLoan(req.params.id, req.body);
    res.json({ data: loan });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    loansService.deleteLoan(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
