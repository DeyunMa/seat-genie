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
    });

    it("should use default offset if offset is missing or empty", () => {
      expect(parsePagination({ limit: "10" })).toEqual({ limit: 10, offset: 0 });
      expect(parsePagination({ limit: "10", offset: "" })).toEqual({ limit: 10, offset: 0 });
      expect(parsePagination({ limit: "10", offset: null })).toEqual({ limit: 10, offset: 0 });
    });

    it("should throw ZodError if limit is less than 1", () => {
      expect(() => parsePagination({ limit: "0" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if limit is greater than 100", () => {
      expect(() => parsePagination({ limit: "101" })).toThrow(z.ZodError);
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

    it("should throw ZodError if limit is less than 1", () => {
      expect(() => parseReportLimit({ limit: "0" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if limit is greater than 50", () => {
      expect(() => parseReportLimit({ limit: "51" })).toThrow(z.ZodError);
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

    it("should throw ZodError if limit is greater than 50", () => {
      expect(() => parseReportPagination({ limit: "51" })).toThrow(z.ZodError);
    });

    it("should throw ZodError if offset is negative", () => {
      expect(() => parseReportPagination({ offset: "-1" })).toThrow(z.ZodError);
    });
  });
});
