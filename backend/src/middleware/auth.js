const jwt = require("jsonwebtoken");
const { UnauthorizedError, ForbiddenError } = require("../utils/errors");

const JWT_SECRET = process.env.JWT_SECRET || "seat-genie-dev-secret";

/**
 * Middleware: verify JWT from Authorization header.
 * Attaches decoded payload to req.user on success.
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new UnauthorizedError("Missing or invalid authorization token"));
    }

    const token = authHeader.slice(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        next(new UnauthorizedError("Token expired or invalid"));
    }
};

/**
 * Middleware: authorize based on user roles.
 * Must be placed after authenticate middleware.
 * @param {string[]} allowedRoles
 */
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return next(new ForbiddenError("Access denied"));
        }
        next();
    };
};

module.exports = { authenticate, authorize };
