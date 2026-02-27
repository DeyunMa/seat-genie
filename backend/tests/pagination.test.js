const { z } = require("zod");
const {
  parsePagination,
  parseReportLimit,
  parseReportPagination,
} = require("../src/utils/pagination");

describe("Pagination Utils", () => {
  describe("parsePagination", () => {
    it("should return default values when input is empty", () => {
      const result = parsePagination({});
      expect(result).toEqual({ limit: 25, offset: 0 });
    });

    it("should throw ZodError when input is undefined", () => {
      expect(() => parsePagination(undefined)).toThrow(z.ZodError);
    });

    it("should parse valid limit and offset from strings", () => {
      const result = parsePagination({ limit: "10", offset: "5" });
      expect(result).toEqual({ limit: 10, offset: 5 });
    });

    it("should parse valid limit and offset from numbers", () => {
      const result = parsePagination({ limit: 10, offset: 5 });
      expect(result).toEqual({ limit: 10, offset: 5 });
    });

    it("should use default limit if limit is missing or empty", () => {
      expect(parsePagination({ offset: "5" })).toEqual({ limit: 25, offset: 5 });
      expect(parsePagination({ limit: "", offset: "5" })).toEqual({ limit: 25, offset: 5 });
      expect(parsePagination({ limit: null, offset: "5" })).toEqual({ limit: 25, offset: 5 });
      expect(parsePagination({ limit: undefined, offset: "5" })).toEqual({ limit: 25, offset: 5 });
    });

    it("should use default offset if offset is missing or empty", () => {
      expect(parsePagination({ limit: "10" })).toEqual({ limit: 10, offset: 0 });
      expect(parsePagination({ limit: "10", offset: "" })).toEqual({ limit: 10, offset: 0 });
      expect(parsePagination({ limit: "10", offset: null })).toEqual({ limit: 10, offset: 0 });
      expect(parsePagination({ limit: "10", offset: undefined })).toEqual({ limit: 10, offset: 0 });
    });

    it("should accept boundary values for limit", () => {
        expect(parsePagination({ limit: "1" })).toEqual({ limit: 1, offset: 0 });
        expect(parsePagination({ limit: "100" })).toEqual({ limit: 100, offset: 0 });
    });

    it("should throw ZodError if limit is less than 1", () => {
      expect(() => parsePagination({ limit: "0" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if limit is greater than 100", () => {
      expect(() => parsePagination({ limit: "101" })).toThrow(z.ZodError);
    });

    it("should accept boundary values for offset", () => {
        expect(parsePagination({ offset: "0" })).toEqual({ limit: 25, offset: 0 });
    });

    it("should throw ZodError if offset is negative", () => {
      expect(() => parsePagination({ offset: "-1" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if limit is not a number", () => {
      expect(() => parsePagination({ limit: "abc" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if offset is not a number", () => {
      expect(() => parsePagination({ offset: "xyz" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if limit is a float", () => {
      expect(() => parsePagination({ limit: "10.5" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if offset is a float", () => {
      expect(() => parsePagination({ offset: "0.5" })).toThrow(z.ZodError);
    });

    it("should handle exponential notation if it results in an integer", () => {
      const result = parsePagination({ limit: "1e1" });
      expect(result).toEqual({ limit: 10, offset: 0 });
    });

    it("should throw ZodError for negative exponential notation", () => {
      expect(() => parsePagination({ limit: "-1e1" })).toThrow(z.ZodError);
    });

    it("should parse exponential notation resulting in valid integer", () => {
      const result = parsePagination({ limit: "1.5e1" });
      expect(result).toEqual({ limit: 15, offset: 0 });
    });

    it("should parse hex notation to integer", () => {
      const result = parsePagination({ limit: "0x10" });
      expect(result).toEqual({ limit: 16, offset: 0 });
    });

    it("should parse octal notation to integer", () => {
      const result = parsePagination({ limit: "010" });
      expect(result).toEqual({ limit: 10, offset: 0 });
    });

    it("should handle whitespace strings", () => {
      const result = parsePagination({ limit: "  10  " });
      expect(result).toEqual({ limit: 10, offset: 0 });
    });

    it("should throw ZodError if limit is Infinity", () => {
      expect(() => parsePagination({ limit: "Infinity" })).toThrow(z.ZodError);
    });
  });

  describe("parseReportLimit", () => {
    it("should return default limit when input is empty", () => {
      const result = parseReportLimit({});
      expect(result).toEqual({ limit: 25 });
    });

    it("should parse valid limit from string", () => {
      const result = parseReportLimit({ limit: "10" });
      expect(result).toEqual({ limit: 10 });
    });

    it("should parse valid limit from number", () => {
      const result = parseReportLimit({ limit: 10 });
      expect(result).toEqual({ limit: 10 });
    });

    it("should use default limit if limit is missing or empty", () => {
        expect(parseReportLimit({ limit: "" })).toEqual({ limit: 25 });
        expect(parseReportLimit({ limit: null })).toEqual({ limit: 25 });
        expect(parseReportLimit({ limit: undefined })).toEqual({ limit: 25 });
    });

    it("should accept boundary values for limit", () => {
        expect(parseReportLimit({ limit: "1" })).toEqual({ limit: 1 });
        expect(parseReportLimit({ limit: "50" })).toEqual({ limit: 50 });
    });

    it("should throw ZodError if limit is less than 1", () => {
      expect(() => parseReportLimit({ limit: "0" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if limit is greater than 50", () => {
      expect(() => parseReportLimit({ limit: "51" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if limit is not a number", () => {
        expect(() => parseReportLimit({ limit: "abc" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if limit is a float", () => {
        expect(() => parseReportLimit({ limit: "10.5" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if limit is Infinity", () => {
        expect(() => parseReportLimit({ limit: "Infinity" })).toThrow(z.ZodError);
    });

    it("should handle whitespace strings", () => {
        expect(parseReportLimit({ limit: "  10  " })).toEqual({ limit: 10 });
    });
  });

  describe("parseReportPagination", () => {
    it("should return default values when input is empty", () => {
      const result = parseReportPagination({});
      expect(result).toEqual({ limit: 25, offset: 0 });
    });

    it("should parse valid limit and offset", () => {
      const result = parseReportPagination({ limit: "10", offset: "5" });
      expect(result).toEqual({ limit: 10, offset: 5 });
    });

    it("should use default limit/offset if missing or empty", () => {
        expect(parseReportPagination({ limit: "", offset: "" })).toEqual({ limit: 25, offset: 0 });
        expect(parseReportPagination({ limit: null, offset: null })).toEqual({ limit: 25, offset: 0 });
    });

    it("should accept boundary values for limit", () => {
        expect(parseReportPagination({ limit: "1" })).toEqual({ limit: 1, offset: 0 });
        expect(parseReportPagination({ limit: "50" })).toEqual({ limit: 50, offset: 0 });
    });

    it("should throw ZodError if limit is greater than 50", () => {
      expect(() => parseReportPagination({ limit: "51" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if offset is negative", () => {
      expect(() => parseReportPagination({ offset: "-1" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if limit is not a number", () => {
        expect(() => parseReportPagination({ limit: "abc" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if offset is not a number", () => {
        expect(() => parseReportPagination({ offset: "xyz" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if limit is a float", () => {
        expect(() => parseReportPagination({ limit: "10.5" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if offset is a float", () => {
        expect(() => parseReportPagination({ offset: "0.5" })).toThrow(z.ZodError);
    });
  });
});
