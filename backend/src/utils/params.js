const parseId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
};

const buildListQuery = (query) => {
  const {
    limit = 25,
    offset = 0,
    sortBy,
    sortOrder,
    ...filters
  } = query;

  return {
    limit: parseInt(limit, 10) || 25,
    offset: parseInt(offset, 10) || 0,
    sortBy,
    sortOrder,
    ...filters
  };
};

module.exports = {
  parseId,
  buildListQuery,
};
