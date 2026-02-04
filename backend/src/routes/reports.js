const express = require("express");
const { z } = require("zod");
const reportsService = require("../services/reportsService");

const router = express.Router();

const overdueQuerySchema = z.object({
  asOf: z.string().datetime().optional(),
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

module.exports = router;
