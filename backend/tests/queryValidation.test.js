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

    it("should throw ZodError if strict schema is used and pagination params are present but not in schema", () => {
      // By default parseListQuery splits logic: parsePagination handles limit/offset,
      // and parseWithSchema handles the rest using the provided schema.
      // If the schema is strict, it will reject keys it doesn't know about.
      // However, parseWithSchema is called with the *entire* query object.
      // So if 'limit' and 'offset' are in 'query', a strict schema will fail unless it includes them.
      const strictSchema = z.object({
        name: z.string(),
      }).strict();

      const query = { name: "test", limit: "10" };
      // This is expected to throw because 'limit' is in query but not in strictSchema
      expect(() => parseListQuery(query, strictSchema)).toThrow(z.ZodError);
    });

    it("should prioritize schema-parsed values if keys overlap with pagination", () => {
        // If the custom schema also parses 'limit' or 'offset', its result comes *after*
        // the default pagination in the spread: { limit, offset, ...parsed }.
        // This means the schema's version overwrites the default one.

        // Let's say schema expects limit to be a string "MAX" or something different than number
        const overrideSchema = z.object({
            limit: z.string().transform(val => val === "MAX" ? 1000 : Number(val))
        });

        const query = { limit: "MAX" };

        // Default pagination parse would likely fail or parse "MAX" to NaN/default if it tried to parse it as number first.
        // Actually parsePagination tries to parse query.limit as number.
        // "MAX" -> Number("MAX") is NaN -> returns "MAX" (from utils/pagination.js toNumber implementation)
        // Then pagination schema validates. min(1).max(100).
        // "MAX" is not a number, so paginationSchema.parse might fail before we even reach schema override?

        // Let's verify paginationSchema behavior first:
        // z.preprocess(toNumber, z.number()...)
        // toNumber("MAX") -> NaN -> returns "MAX".
        // z.number() checks "MAX" -> Fail.

        // So we can't easily override limit/offset if they don't satisfy the base pagination schema first.
        // EXCEPT if we use keys that are not validated by pagination schema? No, parsePagination takes whole query.

        // However, we CAN verify that if both pass, schema wins.
        // limit="10" -> pagination parses to 10.
        // overrideSchema parses "10" -> 999 (contrived example).

        const weirdSchema = z.object({
            limit: z.string().transform(() => 999)
        });

        const result = parseListQuery({ limit: "10" }, weirdSchema);
        expect(result.limit).toBe(999);
    });

    it("should handle null or undefined query gracefully", () => {
        // parsePagination checks query: z.object({...}).parse(query)
        // zod.object().parse(null) throws.
        expect(() => parseListQuery(null, testSchema)).toThrow();
        expect(() => parseListQuery(undefined, testSchema)).toThrow();
    });

    it("should integrate correctly with dateTimeQuery in schema", () => {
        const schema = z.object({
            createdAfter: dateTimeQuery.optional()
        });

        const validDate = "2023-01-01T00:00:00Z";
        const result = parseListQuery({ createdAfter: validDate }, schema);

        expect(result.createdAfter).toBe(validDate);

        const emptyResult = parseListQuery({ createdAfter: "" }, schema);
        expect(emptyResult.createdAfter).toBeUndefined();
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
