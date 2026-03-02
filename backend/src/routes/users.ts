import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as usersService from "../services/usersService";
import { buildListQuery } from "../utils/params";
import { validate } from "../middleware/validate";
import { NotFoundError, ConflictError, AppError } from "../utils/errors";
import { config } from "../config/env";

const protectedRouter = Router();
const publicRouter = Router();

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

const sanitizeUser = (user: any) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

// POST /api/users/login (Public)
publicRouter.post("/login", validate({ body: loginSchema }), (req: Request, res: Response, next: NextFunction) => {
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

// GET /api/users (Protected)
protectedRouter.get("/", validate({ query: listSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = usersService.listUsers(buildListQuery(req.query));
    res.json({ data: result.data.map(sanitizeUser), meta: result.meta });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id (Protected)
protectedRouter.get("/:id", validate({ params: idSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = usersService.getUserById((req.params as any).id);
    if (!user || user.activeStatus !== "Y") {
      throw new NotFoundError("User not found");
    }
    res.json({ data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/users (Protected)
protectedRouter.post("/", validate({ body: userSchema }), async (req: Request, res: Response, next: NextFunction) => {
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

// PUT /api/users/:id (Protected)
protectedRouter.put("/:id", validate({ params: idSchema, body: updateUserSchema }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = usersService.getUserById((req.params as any).id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("User not found");
    }
    const user = await usersService.updateUser((req.params as any).id, req.body);
    res.json({ data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id (Protected)
protectedRouter.delete("/:id", validate({ params: idSchema }), (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = usersService.getUserById((req.params as any).id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("User not found");
    }
    usersService.deleteUser((req.params as any).id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export { publicRouter, protectedRouter };
