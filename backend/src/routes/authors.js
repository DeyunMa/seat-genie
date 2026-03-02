const express = require("express");
const { z } = require("zod");
const authorsService = require("../services/authorsService");
const { validate } = require("../middleware/validate");
const { NotFoundError } = require("../utils/errors");

const router = express.Router();

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

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
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

router.get("/", validate({ query: listQuerySchema }), (req, res, next) => {
  try {
    const { limit, offset, q, sortBy, sortOrder } = req.query;
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
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const author = authorsService.getAuthor(req.params.id);
    if (!author) {
      throw new NotFoundError("Author not found");
    }
    res.json({ data: author });
  } catch (err) {
    next(err);
  }
});

router.post("/", validate({ body: authorSchema }), (req, res, next) => {
  try {
    const author = authorsService.createAuthor(req.body);
    res.status(201).json({ data: author });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validate({ params: idSchema, body: authorSchema }), (req, res, next) => {
  try {
    const author = authorsService.updateAuthor(req.params.id, req.body);
    if (!author) {
      throw new NotFoundError("Author not found");
    }
    res.json({ data: author });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const deleted = authorsService.deleteAuthor(req.params.id);
    if (!deleted) {
      throw new NotFoundError("Author not found");
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
