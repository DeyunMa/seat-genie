const express = require("express");
const { z } = require("zod");
const membersService = require("../services/membersService");
const { parsePagination } = require("../utils/pagination");

const router = express.Router();

const memberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(4).max(20).nullable().optional(),
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
    const members = membersService.listMembers({ limit, offset });
    const total = membersService.countMembers();
    res.json({ data: members, meta: { total, limit, offset } });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid member id" });
    }
    const member = membersService.getMember(id);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    return res.json({ data: member });
  } catch (error) {
    return next(error);
  }
});

router.post("/", (req, res, next) => {
  try {
    const payload = memberSchema.parse(req.body);
    const member = membersService.createMember(payload);
    res.status(201).json({ data: member });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid member id" });
    }
    const payload = memberSchema.parse(req.body);
    const member = membersService.updateMember(id, payload);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
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
      return res.status(400).json({ error: "Invalid member id" });
    }
    const outcome = membersService.deleteMember(id);
    if (!outcome.deleted) {
      if (outcome.reason === "active_loans") {
        return res
          .status(409)
          .json({ error: "Member has active loans" });
      }
      return res.status(404).json({ error: "Member not found" });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
