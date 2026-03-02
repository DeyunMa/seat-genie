const express = require("express");
const { z } = require("zod");
const booksService = require("../services/booksService");
const { validate } = require("../middleware/validate");
const { NotFoundError } = require("../utils/errors");

const router = express.Router();

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const bookSchema = z
  .object({
    title: z.string().min(1),
    isbn: z.string().min(10).max(17),
    author: z.string().min(1),
    publisher: z.string().min(1).optional().nullable(),
    category: z.string().min(1).optional().nullable(),
    location: z.string().min(1).optional().nullable(),
    authorId: z.coerce.number().int().positive().nullable().optional(),
    publishedYear: z.coerce.number().int().min(0).max(3000).nullable().optional(),
    status: z
      .enum(["available", "borrowed", "maintenance", "checked_out", "lost"])
      .default("available"),
    activeStatus: z.enum(["Y", "N"]).default("Y"),
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
  status: z
    .enum(["available", "borrowed", "maintenance", "checked_out", "lost"])
    .optional(),
  authorId: z.preprocess(toNumber, z.number().int().positive().optional()),
  author: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  isbn: z.string().min(1).optional(),
  publishedYear: z.preprocess(
    toNumber,
    z.number().int().min(0).max(3000).optional()
  ),
  sortBy: z
    .enum([
      "id",
      "title",
      "author",
      "category",
      "published_year",
      "status",
      "active_status",
      "author_name",
    ])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  category: z.string().min(1).optional(),
  activeStatus: z.enum(["Y", "N"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

router.get("/", validate({ query: listQuerySchema }), (req, res, next) => {
  try {
    const {
      limit,
      offset,
      status,
      authorId,
      author,
      title,
      isbn,
      publishedYear,
      sortBy,
      sortOrder,
      category,
      activeStatus,
    } = req.query;

    const filters = {
      status,
      authorId,
      author,
      title,
      isbn,
      publishedYear,
      category,
      activeStatus,
    };

    const sort = {
      by: sortBy || "id",
      order: sortOrder || "desc",
    };

    const books = booksService.listBooks({ limit, offset, filters, sort });
    const total = booksService.countBooks(filters);
    res.json({ data: books, meta: { total, limit, offset } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const book = booksService.getBook(req.params.id);
    if (!book) {
      throw new NotFoundError("Book not found");
    }
    res.json({ data: book });
  } catch (err) {
    next(err);
  }
});

router.post("/", validate({ body: bookSchema }), (req, res, next) => {
  try {
    const book = booksService.createBook(req.body);
    res.status(201).json({ data: book });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validate({ params: idSchema, body: bookSchema }), (req, res, next) => {
  try {
    const book = booksService.updateBook(req.params.id, req.body);
    if (!book) {
      throw new NotFoundError("Book not found");
    }
    res.json({ data: book });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", validate({ params: idSchema }), (req, res, next) => {
  try {
    const deleted = booksService.deleteBook(req.params.id);
    if (!deleted) {
      throw new NotFoundError("Book not found");
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
