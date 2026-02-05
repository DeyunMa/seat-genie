const express = require("express");
const { z } = require("zod");
const booksService = require("../services/booksService");
const { parsePagination } = require("../utils/pagination");

const router = express.Router();

const bookSchema = z.object({
  title: z.string().min(1),
  isbn: z.string().min(10).max(17),
  authorId: z.number().int().positive().nullable().optional(),
  publishedYear: z.number().int().min(0).max(3000).nullable().optional(),
  status: z.enum(["available", "checked_out", "lost"]).default("available"),
});

const parseId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
};

router.get("/", (req, res, next) => {
  try {
    const { limit, offset } = parsePagination(req.query);
    const querySchema = z.object({
      status: z.enum(["available", "checked_out", "lost"]).optional(),
      authorId: z.string().optional(),
      title: z.string().min(1).optional(),
      isbn: z.string().min(1).optional(),
      publishedYear: z.string().optional(),
      sortBy: z
        .enum(["id", "title", "published_year", "status", "author_name"])
        .optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    });

    const parsedQuery = querySchema.parse(req.query);
    const authorId = parsedQuery.authorId ? parseId(parsedQuery.authorId) : null;
    const publishedYear = parsedQuery.publishedYear
      ? Number(parsedQuery.publishedYear)
      : null;

    if (parsedQuery.authorId && !authorId) {
      return res.status(400).json({ error: "Invalid author id" });
    }
    if (
      parsedQuery.publishedYear &&
      (!Number.isInteger(publishedYear) || publishedYear < 0)
    ) {
      return res.status(400).json({ error: "Invalid published year" });
    }

    const filters = {
      status: parsedQuery.status,
      authorId,
      title: parsedQuery.title,
      isbn: parsedQuery.isbn,
      publishedYear,
    };

    const sort = {
      by: parsedQuery.sortBy || "id",
      order: parsedQuery.sortOrder || "desc",
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
      return res.status(400).json({ error: "Invalid book id" });
    }
    const book = booksService.getBook(id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    return res.json({ data: book });
  } catch (error) {
    return next(error);
  }
});

router.post("/", (req, res, next) => {
  try {
    const payload = bookSchema.parse(req.body);
    const book = booksService.createBook(payload);
    res.status(201).json({ data: book });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid book id" });
    }
    const payload = bookSchema.parse(req.body);
    const book = booksService.updateBook(id, payload);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
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
      return res.status(400).json({ error: "Invalid book id" });
    }
    const deleted = booksService.deleteBook(id);
    if (!deleted) {
      return res.status(404).json({ error: "Book not found" });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
