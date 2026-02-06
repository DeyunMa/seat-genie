const { z } = require("zod");
const {
  parsePagination,
  reportLimitSchema,
  reportPaginationSchema,
} = require("./pagination");

const emptyToUndefined = (value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }
  return value;
};

const dateTimeQuery = z.preprocess(emptyToUndefined, z.string().datetime());

const parseWithSchema = (schema, query) => {
  if (!schema) {
    return {};
  }
  return schema.parse(query);
};

const parseListQuery = (query, schema) => {
  const { limit, offset } = parsePagination(query);
  const parsed = parseWithSchema(schema, query);
  return { limit, offset, ...parsed };
};

const parseReportLimitQuery = (query, schema) => {
  const mergedSchema = schema
    ? reportLimitSchema.merge(schema)
    : reportLimitSchema;
  return mergedSchema.parse(query);
};

const parseReportPaginationQuery = (query, schema) => {
  const { limit, offset } = reportPaginationSchema.parse(query);
  const parsed = parseWithSchema(schema, query);
  return { limit, offset, ...parsed };
};

module.exports = {
  parseListQuery,
  parseReportLimitQuery,
  parseReportPaginationQuery,
  dateTimeQuery,
};
