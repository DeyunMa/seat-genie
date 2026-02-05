const { z } = require("zod");

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const paginationSchema = z.object({
  limit: z.preprocess(
    toNumber,
    z.number().int().min(1).max(100).default(25)
  ),
  offset: z.preprocess(toNumber, z.number().int().min(0).default(0)),
});

const reportLimitSchema = z.object({
  limit: z.preprocess(
    toNumber,
    z.number().int().min(1).max(50).default(25)
  ),
});

const reportPaginationSchema = reportLimitSchema.extend({
  offset: z.preprocess(toNumber, z.number().int().min(0).default(0)),
});

const parsePagination = (query) => paginationSchema.parse(query);
const parseReportLimit = (query) => reportLimitSchema.parse(query);
const parseReportPagination = (query) => reportPaginationSchema.parse(query);

module.exports = {
  parsePagination,
  parseReportLimit,
  parseReportPagination,
};
