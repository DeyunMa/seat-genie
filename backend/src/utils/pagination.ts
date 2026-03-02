import { z } from "zod";

const toNumber = (value: unknown): unknown => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const paginationSchema = z.object({
  limit: z.preprocess(toNumber, z.number().int().min(1).max(100).default(25)),
  offset: z.preprocess(toNumber, z.number().int().min(0).default(0)),
});

const reportLimitSchema = z.object({
  limit: z.preprocess(toNumber, z.number().int().min(1).max(50).default(25)),
});

const reportPaginationSchema = reportLimitSchema.extend({
  offset: z.preprocess(toNumber, z.number().int().min(0).default(0)),
});

interface Pagination {
  limit: number;
  offset: number;
}

interface ReportLimit {
  limit: number;
}

const parsePagination = (query: unknown): Pagination => paginationSchema.parse(query);
const parseReportLimit = (query: unknown): ReportLimit => reportLimitSchema.parse(query);
const parseReportPagination = (query: unknown): Pagination => reportPaginationSchema.parse(query);

export {
  parsePagination,
  parseReportLimit,
  parseReportPagination,
  paginationSchema,
  reportLimitSchema,
  reportPaginationSchema,
};
