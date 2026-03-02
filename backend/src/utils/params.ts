import type { ListQuery } from "../types";

const parseId = (value: unknown): number | null => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
};

interface RawListQuery {
  limit?: string | number;
  offset?: string | number;
  sortBy?: string;
  sortOrder?: string;
  [key: string]: unknown;
}

const buildListQuery = (query: RawListQuery): ListQuery => {
  const { limit = 25, offset = 0, sortBy, sortOrder, ...filters } = query;
  return {
    limit: parseInt(String(limit), 10) || 25,
    offset: parseInt(String(offset), 10) || 0,
    sortBy,
    sortOrder,
    ...filters,
  };
};

export { parseId, buildListQuery };
