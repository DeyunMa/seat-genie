const express = require("express");
const { z } = require("zod");
const authorsService = require("../services/authorsService");
const { parseId } = require("../utils/params");
const { validateBody, validateListQuery } = require("../middleware/validate");
const { sendInvalidId, sendNotFound } = require("../utils/errors");

const router = express.Router();

const authorSchema = z
  .object({
    name: z.string().min(1),
    bio: z.string().nullable().optional(),
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
  sortBy: z.enum(["id", "name", "created_at"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

router.get("/", validateListQuery(listQuerySchema), (req, res, next) => {
  try {
    const { limit, offset, q, sortBy, sortOrder } = req.listQuery;
    const authors = authorsService.listAuthors({
      limit,
      offset,
      filters: { q },
      sort: { by: sortBy, order: sortOrder },
    });
    const total = authorsService.countAuthors({ q });
    res.json({
      data: authors,
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
      return sendInvalidId(res, "author");
    }
    const author = authorsService.getAuthor(id);
    if (!author) {
      return sendNotFound(res, "Author");
    }
    return res.json({ data: author });
  } catch (error) {
    return next(error);
  }
});

router.post("/", validateBody(authorSchema), (req, res, next) => {
  try {
    const author = authorsService.createAuthor(req.body);
    res.status(201).json({ data: author });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", validateBody(authorSchema), (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return sendInvalidId(res, "author");
    }
    const author = authorsService.updateAuthor(id, req.body);
    if (!author) {
      return sendNotFound(res, "Author");
    }
    return res.json({ data: author });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return sendInvalidId(res, "author");
    }
    const deleted = authorsService.deleteAuthor(id);
    if (!deleted) {
      return sendNotFound(res, "Author");
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
