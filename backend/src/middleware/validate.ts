import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";
import { parseListQuery } from "../utils/queryValidation";

const validateBody = (schema: ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (error) {
      return next(error);
    }
  };

const validateListQuery = (schema?: ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.listQuery = parseListQuery(req.query, schema);
      return next();
    } catch (error) {
      return next(error);
    }
  };

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

// 通用验证中间件 - 支持 body, query, params
const validate = (schemas: ValidationSchemas) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };

export { validateBody, validateListQuery, validate };
