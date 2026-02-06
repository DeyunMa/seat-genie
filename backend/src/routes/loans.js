const express = require("express");
const { z } = require("zod");
const loansService = require("../services/loansService");
const { parseId } = require("../utils/params");
const { validateBody, validateListQuery } = require("../middleware/validate");
const {
  sendConflict,
  sendInvalidId,
  sendNotFound,
} = require("../utils/errors");

const router = express.Router();

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

const loanListQuerySchema = z.object({
  status: z.enum(["open", "returned"]).optional(),
});

router.get("/", validateListQuery(loanListQuerySchema), (req, res, next) => {
  try {
    const { limit, offset, status } = req.listQuery;
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

router.post("/", validateBody(loanCreateSchema), (req, res, next) => {
  try {
    const outcome = loansService.createLoan(req.body);
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

router.put("/:id", validateBody(loanUpdateSchema), (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return sendInvalidId(res, "loan");
    }
    const outcome = loansService.updateLoan(id, req.body);
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
