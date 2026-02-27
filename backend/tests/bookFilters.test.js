// Mock the database to prevent loading better-sqlite3
jest.mock("../src/db", () => ({
  getDb: jest.fn(),
}));

const { buildFilters } = require("../src/services/booksService");

describe("buildFilters", () => {
  it("returns empty clause for empty filters", () => {
    const result = buildFilters({});
    expect(result).toEqual({ where: "", params: [] });
  });

  it("filters by status", () => {
    const result = buildFilters({ status: "available" });
    expect(result.where).toBe("WHERE b.status = ?");
    expect(result.params).toEqual(["available"]);
  });

  it("filters by authorId", () => {
    const result = buildFilters({ authorId: 123 });
    expect(result.where).toBe("WHERE b.author_id = ?");
    expect(result.params).toEqual([123]);
  });

  it("filters by author with partial match", () => {
    const result = buildFilters({ author: "Rowling" });
    expect(result.where).toBe("WHERE b.author LIKE ?");
    expect(result.params).toEqual(["%Rowling%"]);
  });

  it("filters by title with partial match", () => {
    const result = buildFilters({ title: "Harry Potter" });
    expect(result.where).toBe("WHERE b.title LIKE ?");
    expect(result.params).toEqual(["%Harry Potter%"]);
  });

  it("filters by isbn with partial match", () => {
    const result = buildFilters({ isbn: "978" });
    expect(result.where).toBe("WHERE b.isbn LIKE ?");
    expect(result.params).toEqual(["%978%"]);
  });

  it("filters by publishedYear", () => {
    const result = buildFilters({ publishedYear: 2020 });
    expect(result.where).toBe("WHERE b.published_year = ?");
    expect(result.params).toEqual([2020]);
  });

  it("filters by category", () => {
    const result = buildFilters({ category: "Fiction" });
    expect(result.where).toBe("WHERE b.category = ?");
    expect(result.params).toEqual(["Fiction"]);
  });

  it("filters by activeStatus", () => {
    const result = buildFilters({ activeStatus: "Y" });
    expect(result.where).toBe("WHERE b.active_status = ?");
    expect(result.params).toEqual(["Y"]);
  });

  describe("Edge Cases", () => {
    it("handles publishedYear as 0 (valid year)", () => {
      const result = buildFilters({ publishedYear: 0 });
      expect(result.where).toBe("WHERE b.published_year = ?");
      expect(result.params).toEqual([0]);
    });

    it("ignores publishedYear if null or undefined", () => {
      expect(buildFilters({ publishedYear: null })).toEqual({ where: "", params: [] });
      expect(buildFilters({ publishedYear: undefined })).toEqual({ where: "", params: [] });
    });

    it("ignores authorId if 0 (falsy)", () => {
      // Current implementation ignores falsy authorId
      const result = buildFilters({ authorId: 0 });
      expect(result).toEqual({ where: "", params: [] });
    });

    it("ignores empty strings for string fields", () => {
      const result = buildFilters({
        status: "",
        author: "",
        title: "",
        isbn: "",
        category: "",
        activeStatus: ""
      });
      expect(result).toEqual({ where: "", params: [] });
    });

    it("ignores activeStatus if 0 or false", () => {
      expect(buildFilters({ activeStatus: 0 })).toEqual({ where: "", params: [] });
      expect(buildFilters({ activeStatus: false })).toEqual({ where: "", params: [] });
    });
  });

  it("combines multiple filters preserving order", () => {
    const filters = {
      status: "available",
      authorId: 10,
      author: "John",
      title: "Doe",
      isbn: "123",
      publishedYear: 2021,
      category: "Science",
      activeStatus: "Y"
    };

    const result = buildFilters(filters);

    // The expected order depends on the implementation of buildFilters
    // Implementation order: status, authorId, author, title, isbn, publishedYear, category, activeStatus

    const expectedClauses = [
      "b.status = ?",
      "b.author_id = ?",
      "b.author LIKE ?",
      "b.title LIKE ?",
      "b.isbn LIKE ?",
      "b.published_year = ?",
      "b.category = ?",
      "b.active_status = ?"
    ];

    expect(result.where).toBe(`WHERE ${expectedClauses.join(" AND ")}`);

    // Strict order check
    expect(result.params).toEqual([
      "available",
      10,
      "%John%",
      "%Doe%",
      "%123%",
      2021,
      "Science",
      "Y"
    ]);
  });
});
