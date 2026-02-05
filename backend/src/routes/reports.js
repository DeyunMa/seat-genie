const express = require("express");
const { z } = require("zod");
const reportsService = require("../services/reportsService");
const { parsePagination } = require("../utils/pagination");

const router = express.Router();

const overdueQuerySchema = z.object({
  asOf: z.string().datetime().optional(),
});

const activeMembersQuerySchema = z.object({
  since: z.string().datetime().optional(),
  status: z.enum(["open", "returned"]).optional(),
});

const mostBorrowedBooksQuerySchema = z.object({
  since: z.string().datetime().optional(),
  status: z.enum(["open", "returned"]).optional(),
});

const inventoryHealthQuerySchema = z.object({
  asOf: z.string().datetime().optional(),
});

const memberLoanHistoryQuerySchema = z.object({
  since: z.string().datetime().optional(),
  status: z.enum(["open", "returned"]).optional(),
});

const bookLoanHistoryQuerySchema = z.object({
  since: z.string().datetime().optional(),
  status: z.enum(["open", "returned"]).optional(),
});

const parseId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
};

router.get("/overdue-loans", (req, res, next) => {
  try {
    const { asOf } = overdueQuerySchema.parse(req.query);
    const overdueLoans = reportsService.listOverdueLoans(asOf);
    return res.json({ data: overdueLoans });
  } catch (error) {
    return next(error);
  }
});

router.get("/most-active-members", (req, res, next) => {
  try {
    const { limit } = parsePagination(req.query);
    const { since, status } = activeMembersQuerySchema.parse(req.query);
    const members = reportsService.listMostActiveMembers({
      limit,
      since,
      status,
    });
    return res.json({
      data: members,
      meta: { limit, since: since ?? null, status: status ?? null },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/most-borrowed-books", (req, res, next) => {
  try {
    const { limit } = parsePagination(req.query);
    const { since, status } = mostBorrowedBooksQuerySchema.parse(req.query);
    const books = reportsService.listMostBorrowedBooks({
      limit,
      since,
      status,
    });
    return res.json({
      data: books,
      meta: { limit, since: since ?? null, status: status ?? null },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/inventory-health", (req, res, next) => {
  try {
    const { asOf } = inventoryHealthQuerySchema.parse(req.query);
    const health = reportsService.getInventoryHealth(asOf);
    return res.json({
      data: {
        totalBooks: health.totalBooks,
        statusCounts: health.statusCounts,
        overdue: health.overdue,
      },
      meta: { asOf: health.asOf },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/member-loan-history/:memberId", (req, res, next) => {
  try {
    const memberId = parseId(req.params.memberId);
    if (!memberId) {
      return res.status(400).json({ error: "Invalid member id" });
    }
    const { limit, offset } = parsePagination(req.query);
    const { since, status } = memberLoanHistoryQuerySchema.parse(req.query);
    const history = reportsService.getMemberLoanHistory({
      memberId,
      since,
      status,
      limit,
      offset,
    });
    if (history.error === "member_not_found") {
      return res.status(404).json({ error: "Member not found" });
    }
    return res.json({
      data: {
        member: history.member,
        loans: history.loans,
      },
      meta: {
        total: history.total,
        limit,
        offset,
        since: since ?? null,
        status: status ?? null,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/book-loan-history/:bookId", (req, res, next) => {
  try {
    const bookId = parseId(req.params.bookId);
    if (!bookId) {
      return res.status(400).json({ error: "Invalid book id" });
    }
    const { limit, offset } = parsePagination(req.query);
    const { since, status } = bookLoanHistoryQuerySchema.parse(req.query);
    const history = reportsService.getBookLoanHistory({
      bookId,
      since,
      status,
      limit,
      offset,
    });
    if (history.error === "book_not_found") {
      return res.status(404).json({ error: "Book not found" });
    }
    return res.json({
      data: {
        book: history.book,
        loans: history.loans,
      },
      meta: {
        total: history.total,
        limit,
        offset,
        since: since ?? null,
        status: status ?? null,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
