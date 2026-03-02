const express = require("express");
const { z } = require("zod");
const membersService = require("../services/membersService");
const { validate } = require("../middleware/validate");
const { NotFoundError } = require("../utils/errors");

const router = express.Router();

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const memberSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(4).max(20).nullable().optional(),
  })
  .strict();

const emptyToUndefined = (value) => {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const listQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  sortBy: z.enum(["id", "name", "email", "created_at"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

router.get("/", validate({ query: listQuerySchema }), (req, res, next) => {
  try {
    const { limit, offset, q, sortBy, sortOrder } = req.query;
    const members = membersService.listMembers({
      limit,
      offset,
      filters: { q },
      sort: { by: sortBy, order: sortOrder },
    });
    const total = membersService.countMembers({ q });
    res.json({
      data: members,
      meta: {
        total,
        limit,
        offset,
        q: q ?? null,
        sortBy: sortBy ?? null,
        sortOrder: sortOrder ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const member = membersService.getMember(req.params.id);
    if (!member) {
      throw new NotFoundError("Member not found");
    }
    res.json({ data: member });
  } catch (err) {
    next(err);
  }
});

router.post("/", validate({ body: memberSchema }), (req, res, next) => {
  try {
    const member = membersService.createMember(req.body);
    res.status(201).json({ data: member });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validate({ params: idSchema, body: memberSchema }), (req, res, next) => {
  try {
    const member = membersService.updateMember(req.params.id, req.body);
    if (!member) {
      throw new NotFoundError("Member not found");
    }
    res.json({ data: member });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    membersService.deleteMember(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
