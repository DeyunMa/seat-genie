const express = require("express");
const { z } = require("zod");
const booksService = require("../services/booksService");

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
    const books = booksService.listBooks();
    res.json({ data: books });
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
