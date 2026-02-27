const express = require("express");
const { z } = require("zod");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usersService = require("../services/usersService");
const { buildListQuery } = require("../utils/params");
const { validate } = require("../middleware/validate");
const { NotFoundError, ConflictError, AppError } = require("../utils/errors");
const { config } = require("../config/env");

const router = express.Router();

const JWT_EXPIRES_IN = "7d";

// Schemas
const listSchema = z.object({
  role: z.enum(["admin", "staff", "student"]).optional(),
  q: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const userSchema = z.object({
  username: z.string().min(1),
  password: passwordSchema,
  name: z.string().min(1),
  role: z.enum(["admin", "staff", "student"]),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  studentId: z.string().optional().nullable(),
});

const updateUserSchema = z.object({
  username: z.string().min(1).optional(),
  password: passwordSchema.optional(),
  name: z.string().min(1).optional(),
  role: z.enum(["admin", "staff", "student"]).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  studentId: z.string().optional().nullable(),
  activeStatus: z.enum(["Y", "N"]).optional(),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Helper: strip password from user object
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

// POST /api/users/login
router.post("/login", validate({ body: loginSchema }), (req, res, next) => {
  try {
    const user = usersService.getUserByUsername(req.body.username);
    if (!user || user.activeStatus !== "Y") {
      throw new AppError("用户名或密码错误", 401, "INVALID_CREDENTIALS");
    }

    const passwordMatch = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordMatch) {
      throw new AppError("用户名或密码错误", 401, "INVALID_CREDENTIALS");
    }

    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: JWT_EXPIRES_IN });

    res.json({ data: { token, user: sanitizeUser(user) } });
  } catch (err) {
    next(err);
  }
});

// GET /api/users
router.get("/", validate({ query: listSchema }), (req, res, next) => {
  try {
    const result = usersService.listUsers(buildListQuery(req.query));
    res.json({ data: result.data.map(sanitizeUser), meta: result.meta });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id
router.get("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const user = usersService.getUserById(req.params.id);
    if (!user || user.activeStatus !== "Y") {
      throw new NotFoundError("User not found");
    }
    res.json({ data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/users
router.post("/", validate({ body: userSchema }), async (req, res, next) => {
  try {
    const existing = usersService.getUserByUsername(req.body.username);
    if (existing) {
      throw new ConflictError("Username already exists");
    }
    const user = await usersService.createUser(req.body);
    res.status(201).json({ data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id
router.put("/:id", validate({ params: idSchema, body: updateUserSchema }), async (req, res, next) => {
  try {
    const existing = usersService.getUserById(req.params.id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("User not found");
    }
    const user = await usersService.updateUser(req.params.id, req.body);
    res.json({ data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id
router.delete("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const existing = usersService.getUserById(req.params.id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("User not found");
    }
    usersService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
