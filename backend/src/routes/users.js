const express = require("express");
const { z } = require("zod");
const usersService = require("../services/usersService");
const { buildListQuery } = require("../utils/params");
const { validate } = require("../middleware/validate");
const { NotFoundError, ConflictError } = require("../utils/errors");

const router = express.Router();

const listSchema = z.object({
  role: z.enum(["admin", "staff", "student"]).optional(),
  q: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const userSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(["admin", "staff", "student"]),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  studentId: z.string().optional().nullable(),
});

const updateUserSchema = z.object({
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  role: z.enum(["admin", "staff", "student"]).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  studentId: z.string().optional().nullable(),
});

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

router.get("/", validate({ query: listSchema }), (req, res, next) => {
  try {
    const result = usersService.listUsers(buildListQuery(req.query));
    res.json({ data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const user = usersService.getUserById(req.params.id);
    if (!user || user.activeStatus !== "Y") {
      throw new NotFoundError("User not found");
    }
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

router.post("/", validate({ body: userSchema }), (req, res, next) => {
  try {
    const existing = usersService.getUserByUsername(req.body.username);
    if (existing) {
      throw new ConflictError("Username already exists");
    }
    const user = usersService.createUser(req.body);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validate({ params: idSchema, body: updateUserSchema }), (req, res, next) => {
  try {
    const existing = usersService.getUserById(req.params.id);
    if (!existing || existing.activeStatus !== "Y") {
      throw new NotFoundError("User not found");
    }
    const user = usersService.updateUser(req.params.id, req.body);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

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
