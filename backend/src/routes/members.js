const express = require("express");
const { z } = require("zod");
const membersService = require("../services/membersService");
const { parseId } = require("../utils/params");
const { validateBody, validateListQuery } = require("../middleware/validate");
const { sendConflict, sendInvalidId, sendNotFound } = require("../utils/errors");

const router = express.Router();

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
});

router.get("/", validateListQuery(listQuerySchema), (req, res, next) => {
  try {
    const { limit, offset, q, sortBy, sortOrder } = req.listQuery;
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
  } catch (error) {
    next(error);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return sendInvalidId(res, "member");
    }
    const member = membersService.getMember(id);
    if (!member) {
      return sendNotFound(res, "Member");
    }
    return res.json({ data: member });
  } catch (error) {
    return next(error);
  }
});

router.post("/", validateBody(memberSchema), (req, res, next) => {
  try {
    const member = membersService.createMember(req.body);
    res.status(201).json({ data: member });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", validateBody(memberSchema), (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return sendInvalidId(res, "member");
    }
    const member = membersService.updateMember(id, req.body);
    if (!member) {
      return sendNotFound(res, "Member");
    }
    return res.json({ data: member });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return sendInvalidId(res, "member");
    }
    const outcome = membersService.deleteMember(id);
    if (!outcome.deleted) {
      if (outcome.reason === "active_loans") {
        return sendConflict(res, "Member has active loans");
      }
      return sendNotFound(res, "Member");
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
