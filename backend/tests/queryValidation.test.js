const { z } = require("zod");
const {
  parseListQuery,
  parseReportLimitQuery,
  parseReportPaginationQuery,
  dateTimeQuery,
} = require("../src/utils/queryValidation");

describe("queryValidation utils", () => {
  describe("dateTimeQuery", () => {
    it("should transform empty string to undefined", () => {
      const result = dateTimeQuery.parse("");
      expect(result).toBeUndefined();
    });

    it("should transform null to undefined", () => {
      const result = dateTimeQuery.parse(null);
      expect(result).toBeUndefined();
    });

    it("should transform undefined to undefined", () => {
      const result = dateTimeQuery.parse(undefined);
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

    it("should throw an error for non-string input", () => {
      const invalidInput = 12345;
      expect(() => dateTimeQuery.parse(invalidInput)).toThrow(z.ZodError);
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
