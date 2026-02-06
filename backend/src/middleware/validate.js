const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    return next();
  } catch (error) {
    return next(error);
  }
};

const { parseListQuery } = require("../utils/queryValidation");

const validateListQuery = (schema) => (req, res, next) => {
  try {
    req.listQuery = parseListQuery(req.query, schema);
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { validateBody, validateListQuery };
