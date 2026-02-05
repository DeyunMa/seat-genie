const express = require("express");
const { z } = require("zod");
const loansService = require("../services/loansService");
const { parseListQuery } = require("../utils/queryValidation");

const router = express.Router();

const loanCreateSchema = z.object({
  bookId: z.number().int().positive(),
  memberId: z.number().int().positive(),
  dueAt: z.string().datetime(),
});

const loanUpdateSchema = z
  .object({
    dueAt: z.string().datetime().optional(),
    returnedAt: z.string().datetime().optional(),
  })
  .refine((data) => data.dueAt || data.returnedAt, {
    message: "Provide dueAt or returnedAt",
  });

const loanListQuerySchema = z.object({
  status: z.enum(["open", "returned"]).optional(),
});

const parseId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
};

router.get("/", (req, res, next) => {
  try {
    const { limit, offset, status } = parseListQuery(
      req.query,
      loanListQuerySchema
    );
    const loans = loansService.listLoans({ limit, offset, status });
    const total = loansService.countLoans(status);
    res.json({
      data: loans,
      meta: { total, limit, offset, status: status ?? null },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid loan id" });
    }
    const loan = loansService.getLoan(id);
    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }
    return res.json({ data: loan });
  } catch (error) {
    return next(error);
  }
});

router.post("/", (req, res, next) => {
  try {
    const payload = loanCreateSchema.parse(req.body);
    const outcome = loansService.createLoan(payload);
    if (outcome.error === "book_not_found") {
      return res.status(404).json({ error: "Book not found" });
    }
    if (outcome.error === "member_not_found") {
      return res.status(404).json({ error: "Member not found" });
    }
    if (outcome.error === "book_unavailable") {
      return res.status(409).json({ error: "Book not available" });
    }
    return res.status(201).json({ data: outcome.data });
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid loan id" });
    }
    const payload = loanUpdateSchema.parse(req.body);
    const outcome = loansService.updateLoan(id, payload);
    if (outcome.error === "loan_not_found") {
      return res.status(404).json({ error: "Loan not found" });
    }
    return res.json({ data: outcome.data });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid loan id" });
    }
    const outcome = loansService.deleteLoan(id);
    if (!outcome.deleted) {
      return res.status(404).json({ error: "Loan not found" });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
