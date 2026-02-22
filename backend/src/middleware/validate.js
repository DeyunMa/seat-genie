const { z } = require("zod");

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

// 通用验证中间件 - 支持 body, query, params
const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.query) {
      req.query = schemas.query.parse(req.query);
    }
    if (schemas.params) {
      req.params = schemas.params.parse(req.params);
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { validateBody, validateListQuery, validate };
