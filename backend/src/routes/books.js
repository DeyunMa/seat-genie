const express = require("express");
const { z } = require("zod");
const booksService = require("../services/booksService");
const { parseId } = require("../utils/params");
const { validateBody, validateListQuery } = require("../middleware/validate");
const { sendInvalidId, sendNotFound } = require("../utils/errors");

const router = express.Router();

const bookSchema = z
  .object({
    title: z.string().min(1),
    isbn: z.string().min(10).max(17),
    authorId: z.coerce.number().int().positive().nullable().optional(),
    publishedYear: z.coerce.number().int().min(0).max(3000).nullable().optional(),
    status: z.enum(["available", "checked_out", "lost"]).default("available"),
  })
  .strict();

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const listQuerySchema = z.object({
  status: z.enum(["available", "checked_out", "lost"]).optional(),
  authorId: z.preprocess(toNumber, z.number().int().positive().optional()),
  title: z.string().min(1).optional(),
  isbn: z.string().min(1).optional(),
  publishedYear: z.preprocess(
    toNumber,
    z.number().int().min(0).max(3000).optional()
  ),
  sortBy: z
    .enum(["id", "title", "published_year", "status", "author_name"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

router.get("/", validateListQuery(listQuerySchema), (req, res, next) => {
  try {
    const {
      limit,
      offset,
      status,
      authorId,
      title,
      isbn,
      publishedYear,
      sortBy,
      sortOrder,
    } = req.listQuery;

    const filters = {
      status,
      authorId,
      title,
      isbn,
      publishedYear,
    };

    const sort = {
      by: sortBy || "id",
      order: sortOrder || "desc",
    };

    const books = booksService.listBooks({ limit, offset, filters, sort });
    const total = booksService.countBooks(filters);
    res.json({ data: books, meta: { total, limit, offset } });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return sendInvalidId(res, "book");
    }
    const book = booksService.getBook(id);
    if (!book) {
      return sendNotFound(res, "Book");
    }
    return res.json({ data: book });
  } catch (error) {
    return next(error);
  }
});

router.post("/", validateBody(bookSchema), (req, res, next) => {
  try {
    const book = booksService.createBook(req.body);
    res.status(201).json({ data: book });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", validateBody(bookSchema), (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return sendInvalidId(res, "book");
    }
    const book = booksService.updateBook(id, req.body);
    if (!book) {
      return sendNotFound(res, "Book");
    }
    return res.json({ data: book });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return sendInvalidId(res, "book");
    }
    const deleted = booksService.deleteBook(id);
    if (!deleted) {
      return sendNotFound(res, "Book");
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
