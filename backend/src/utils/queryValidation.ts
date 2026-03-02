import { z } from "zod";
import type { ZodTypeAny } from "zod";
import { parsePagination, reportLimitSchema, reportPaginationSchema } from "./pagination";

const emptyToUndefined = (value: unknown): unknown => {
  if (value === "" || value === null || value === undefined) return undefined;
  return value;
};

const dateTimeQuery = z.preprocess(
  emptyToUndefined,
  z.string().datetime({ offset: true }).optional(),
);

const parseWithSchema = (schema: ZodTypeAny | undefined, query: unknown): Record<string, unknown> => {
  if (!schema) return {};
  return schema.parse(query) as Record<string, unknown>;
};

interface ParsedListQuery extends Record<string, unknown> {
  limit: number;
  offset: number;
}

const parseListQuery = (query: unknown, schema?: ZodTypeAny): ParsedListQuery => {
  const { limit, offset } = parsePagination(query);
  const parsed = parseWithSchema(schema, query);
  return { limit, offset, ...parsed };
};

const parseReportLimitQuery = (query: unknown, schema?: z.ZodObject<z.ZodRawShape>): Record<string, unknown> => {
  const mergedSchema = schema ? reportLimitSchema.merge(schema) : reportLimitSchema;
  return mergedSchema.parse(query) as Record<string, unknown>;
};

const parseReportPaginationQuery = (query: unknown, schema?: ZodTypeAny): ParsedListQuery => {
  const { limit, offset } = reportPaginationSchema.parse(query);
  const parsed = parseWithSchema(schema, query);
  return { limit, offset, ...parsed };
};

export { parseListQuery, parseReportLimitQuery, parseReportPaginationQuery, dateTimeQuery };
