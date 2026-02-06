const express = require("express");
const { z } = require("zod");
const booksService = require("../services/booksService");
const { parseListQuery } = require("../utils/queryValidation");
const { parseId } = require("../utils/params");
const { validateBody } = require("../middleware/validate");
const {
  sendInvalidId,
  sendNotFound,
  sendValidationError,
} = require("../utils/errors");

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

router.get("/", (req, res, next) => {
  try {
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

    const parsedQuery = parseListQuery(req.query, querySchema);
    const authorId = parsedQuery.authorId ? parseId(parsedQuery.authorId) : null;
    const publishedYear = parsedQuery.publishedYear
      ? Number(parsedQuery.publishedYear)
      : null;

    if (parsedQuery.authorId && !authorId) {
      return sendInvalidId(res, "author");
    }
    if (
      parsedQuery.publishedYear &&
      (!Number.isInteger(publishedYear) || publishedYear < 0)
    ) {
      return sendValidationError(res, "Invalid published year");
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
