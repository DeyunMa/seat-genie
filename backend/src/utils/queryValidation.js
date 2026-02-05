const {
  parsePagination,
  parseReportLimit,
  parseReportPagination,
} = require("./pagination");

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
  const { limit } = parseReportLimit(query);
  const parsed = parseWithSchema(schema, query);
  return { limit, ...parsed };
};

const parseReportPaginationQuery = (query, schema) => {
  const { limit, offset } = parseReportPagination(query);
  const parsed = parseWithSchema(schema, query);
  return { limit, offset, ...parsed };
};

module.exports = {
  parseListQuery,
  parseReportLimitQuery,
  parseReportPaginationQuery,
};
