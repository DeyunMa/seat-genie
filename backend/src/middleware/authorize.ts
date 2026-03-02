import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/errors";
import type { UserRole } from "../types";

/**
 * 角色授权中间件，需在 authenticate 之后使用。
 * @param  {...string} allowedRoles - 允许访问的角色列表
 */
const authorize = (...allowedRoles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }
    next();
  };

export { authorize };
