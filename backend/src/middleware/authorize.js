const { ForbiddenError } = require("../utils/errors");

/**
 * 角色授权中间件，需在 authenticate 之后使用。
 * @param  {...string} allowedRoles - 允许访问的角色列表
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new ForbiddenError("Insufficient permissions"));
  }
  next();
};

module.exports = { authorize };
