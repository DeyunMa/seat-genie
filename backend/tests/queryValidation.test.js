const { z } = require("zod");
const {
  parseListQuery,
  parseReportLimitQuery,
  parseReportPaginationQuery,
  dateTimeQuery,
} = require("../src/utils/queryValidation");

describe("queryValidation utils", () => {
  describe("dateTimeQuery", () => {
    // When used in Zod schemas as .optional(), undefined is valid.
    // However, when testing the schema directly with .parse(), the base schema (z.string()) expects a string.
    // The preprocess turns empty/null/undefined into undefined.
    // z.string().datetime() requires a string, so undefined fails validation unless .optional() is used.

    const optionalDateTimeQuery = dateTimeQuery.optional();

    it("should transform empty string to undefined (when optional)", () => {
      const result = optionalDateTimeQuery.parse("");
      expect(result).toBeUndefined();
    });

    it("should transform null to undefined (when optional)", () => {
      const result = optionalDateTimeQuery.parse(null);
      expect(result).toBeUndefined();
    });

    it("should transform undefined to undefined (when optional)", () => {
      const result = optionalDateTimeQuery.parse(undefined);
      expect(result).toBeUndefined();
    });

    it("should validate a valid ISO datetime string", () => {
      const validDate = "2023-10-27T10:00:00Z";
      const result = dateTimeQuery.parse(validDate);
      expect(result).toBe(validDate);
    });

    it("should throw an error for an invalid datetime string", () => {
      const invalidDate = "invalid-date";
      expect(() => dateTimeQuery.parse(invalidDate)).toThrow(z.ZodError);
    });
  });

  describe("parseListQuery", () => {
    const testSchema = z.object({
      filter: z.string().optional(),
      sort: z.string().optional(),
    });

    it("should return default limit and offset when query is empty", () => {
      const result = parseListQuery({}, testSchema);
      expect(result).toEqual({
        limit: 25,
        offset: 0,
      });
    });

    it("should parse string numbers for limit and offset", () => {
      const query = { limit: "10", offset: "5" };
      const result = parseListQuery(query, testSchema);
      expect(result).toEqual({
        limit: 10,
        offset: 5,
      });
    });

    it("should validate and merge additional schema properties", () => {
      const query = { limit: "10", filter: "active", sort: "asc" };
      const result = parseListQuery(query, testSchema);
      expect(result).toEqual({
        limit: 10,
        offset: 0,
        filter: "active",
        sort: "asc",
      });
    });

    it("should handle missing schema (empty object return)", () => {
      // The implementation of parseWithSchema returns {} if schema is falsy
      const query = { limit: "10" };
      const result = parseListQuery(query, null);
      expect(result).toEqual({
        limit: 10,
        offset: 0,
      });
    });

    it("should throw ZodError for invalid limit (too low)", () => {
      const query = { limit: "0" };
      expect(() => parseListQuery(query, testSchema)).toThrow(z.ZodError);
    });

    it("should throw ZodError for invalid limit (too high)", () => {
      const query = { limit: "101" };
      expect(() => parseListQuery(query, testSchema)).toThrow(z.ZodError);
    });

    it("should throw ZodError for invalid offset (negative)", () => {
      const query = { offset: "-1" };
      expect(() => parseListQuery(query, testSchema)).toThrow(z.ZodError);
    });

    it("should throw ZodError for invalid additional schema properties", () => {
      const schema = z.object({
        age: z.number(),
      });
      const query = { age: "not a number" };
      expect(() => parseListQuery(query, schema)).toThrow(z.ZodError);
    });

    it("should prioritize limit/offset from schema if conflict exists", () => {
      const conflictSchema = z.object({
        limit: z.string(), // Schema expects string limit
        extra: z.string(),
      });
      const query = { limit: "10", extra: "test" };

      const result = parseListQuery(query, conflictSchema);
      // It got overwritten by schema
      expect(result.limit).toBe("10");
      expect(result.extra).toBe("test");
    });

    it("should strip fields not in schema", () => {
      const query = { limit: "10", extraField: "shouldBeGone" };
      const result = parseListQuery(query, testSchema);
      expect(result).not.toHaveProperty("extraField");
      expect(result).toEqual({ limit: 10, offset: 0 });
    });

    it("should throw error if query is null", () => {
       expect(() => parseListQuery(null, testSchema)).toThrow(z.ZodError);
    });

    it("should throw error if query is undefined", () => {
       expect(() => parseListQuery(undefined, testSchema)).toThrow(z.ZodError);
    });

    it("should throw validation error if limit is non-numeric string", () => {
      const query = { limit: "abc" };
      expect(() => parseListQuery(query, testSchema)).toThrow(z.ZodError);
    });
  });

  describe("parseReportLimitQuery", () => {
    it("should use report default limit (25)", () => {
      const result = parseReportLimitQuery({});
      expect(result).toEqual({ limit: 25 });
    });

    it("should allow valid limit within report range (1-50)", () => {
      const result = parseReportLimitQuery({ limit: "50" });
      expect(result).toEqual({ limit: 50 });
    });

    it("should throw error if limit exceeds report max (50)", () => {
      expect(() => parseReportLimitQuery({ limit: "51" })).toThrow(z.ZodError);
    });

    it("should merge with additional schema", () => {
      const schema = z.object({ type: z.string() });
      const result = parseReportLimitQuery({ limit: "10", type: "summary" }, schema);
      expect(result).toEqual({ limit: 10, type: "summary" });
    });
  });

  describe("parseReportPaginationQuery", () => {
    it("should return default report pagination values", () => {
      const result = parseReportPaginationQuery({}, null);
      expect(result).toEqual({ limit: 25, offset: 0 });
    });

    it("should enforce report limit max (50)", () => {
        expect(() => parseReportPaginationQuery({ limit: "51" }, null)).toThrow(z.ZodError);
    });

    it("should merge with additional schema", () => {
      const schema = z.object({ type: z.string() });
      const result = parseReportPaginationQuery({ limit: "10", type: "detailed" }, schema);
      expect(result).toEqual({ limit: 10, offset: 0, type: "detailed" });
    });
  });
});
