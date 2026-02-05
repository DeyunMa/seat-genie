const express = require("express");
const { z } = require("zod");
const loansService = require("../services/loansService");
const { parseListQuery } = require("../utils/queryValidation");
const { parseId } = require("../utils/params");
const {
  sendConflict,
  sendInvalidId,
  sendNotFound,
} = require("../utils/errors");

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
      return sendInvalidId(res, "loan");
    }
    const loan = loansService.getLoan(id);
    if (!loan) {
      return sendNotFound(res, "Loan");
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
      return sendNotFound(res, "Book");
    }
    if (outcome.error === "member_not_found") {
      return sendNotFound(res, "Member");
    }
    if (outcome.error === "book_unavailable") {
      return sendConflict(res, "Book not available");
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
      return sendInvalidId(res, "loan");
    }
    const payload = loanUpdateSchema.parse(req.body);
    const outcome = loansService.updateLoan(id, payload);
    if (outcome.error === "loan_not_found") {
      return sendNotFound(res, "Loan");
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
      return sendInvalidId(res, "loan");
    }
    const outcome = loansService.deleteLoan(id);
    if (!outcome.deleted) {
      return sendNotFound(res, "Loan");
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
