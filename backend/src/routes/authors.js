const express = require("express");
const { z } = require("zod");
const authorsService = require("../services/authorsService");
const { parsePagination } = require("../utils/pagination");

const router = express.Router();

const authorSchema = z.object({
  name: z.string().min(1),
  bio: z.string().nullable().optional(),
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
    const authors = authorsService.listAuthors({ limit, offset });
    const total = authorsService.countAuthors();
    res.json({ data: authors, meta: { total, limit, offset } });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid author id" });
    }
    const author = authorsService.getAuthor(id);
    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }
    return res.json({ data: author });
  } catch (error) {
    return next(error);
  }
});

router.post("/", (req, res, next) => {
  try {
    const payload = authorSchema.parse(req.body);
    const author = authorsService.createAuthor(payload);
    res.status(201).json({ data: author });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid author id" });
    }
    const payload = authorSchema.parse(req.body);
    const author = authorsService.updateAuthor(id, payload);
    if (!author) {
      return res.status(404).json({ error: "Author not found" });
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
      return res.status(400).json({ error: "Invalid author id" });
    }
    const deleted = authorsService.deleteAuthor(id);
    if (!deleted) {
      return res.status(404).json({ error: "Author not found" });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
