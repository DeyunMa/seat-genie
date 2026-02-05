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
});

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
    const { since } = activeMembersQuerySchema.parse(req.query);
    const members = reportsService.listMostActiveMembers({ limit, since });
    return res.json({
      data: members,
      meta: { limit, since: since ?? null },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
