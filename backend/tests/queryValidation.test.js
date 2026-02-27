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

    it("should throw an error for non-string inputs", () => {
      expect(() => dateTimeQuery.parse(123)).toThrow(z.ZodError);
      expect(() => dateTimeQuery.parse(true)).toThrow(z.ZodError);
      expect(() => dateTimeQuery.parse({})).toThrow(z.ZodError);
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

    it("should handle overlapping fields by prioritizing the schema", () => {
      // We test that if the schema provides a limit, it overrides the one from parsePagination.
      // Note: parsePagination runs first, so the value must be valid according to base pagination rules (<= 100).
      // We use a transformer to return a distinct value to prove precedence.
      const overrideSchema = z.object({
        limit: z.preprocess((val) => Number(val), z.number().transform(() => 99)),
      });
      const query = { limit: "10" };
      const result = parseListQuery(query, overrideSchema);
      expect(result).toEqual({
        limit: 99,
        offset: 0,
      });
    });

    it("should strip extra fields not in the schema", () => {
      // Zod strips by default
      const result = parseListQuery({ limit: "10", extra: "field" }, testSchema);
      expect(result).not.toHaveProperty("extra");
      expect(result).toEqual({
        limit: 10,
        offset: 0,
      });
    });

    it("should throw error if schema is strict and extra fields are present", () => {
      const strictSchema = z.object({
        name: z.string(),
      }).strict();

      // limit and offset are handled separately, but they are still in the 'query' object passed to parseWithSchema.
      // If strictSchema is used, it will see 'limit' and 'offset' as unknown keys and throw.
      const query = { limit: "10", name: "test" };
      expect(() => parseListQuery(query, strictSchema)).toThrow(z.ZodError);
    });

    it("should throw error for type coercion conflicts", () => {
      // Schema expects a number strictly, but query provides a string.
      // parsePagination handles limit/offset separately, but if we define another field
      const schema = z.object({
        age: z.number(), // Strict number, no coerce
      });
      const query = { age: "25" };
      expect(() => parseListQuery(query, schema)).toThrow(z.ZodError);
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
