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

  it("filters by partial strings (title, author, isbn)", () => {
    const result = buildFilters({
      title: "Potter",
      author: "Rowling",
      isbn: "978",
    });

    // Order depends on implementation, but based on reading code:
    // status, authorId, author, title, isbn, publishedYear, category, activeStatus

    expect(result.where).toContain("b.author LIKE ?");
    expect(result.where).toContain("b.title LIKE ?");
    expect(result.where).toContain("b.isbn LIKE ?");

    expect(result.params).toEqual(
      expect.arrayContaining(["%Rowling%", "%Potter%", "%978%"])
    );
  });

  it("filters by publishedYear", () => {
    const result1 = buildFilters({ publishedYear: 2020 });
    expect(result1.where).toBe("WHERE b.published_year = ?");
    expect(result1.params).toEqual([2020]);

    const result2 = buildFilters({ publishedYear: 0 });
    expect(result2.where).toBe("WHERE b.published_year = ?");
    expect(result2.params).toEqual([0]);

    const result3 = buildFilters({ publishedYear: null });
    expect(result3).toEqual({ where: "", params: [] });
  });

  it("combines multiple filters", () => {
    const result = buildFilters({
      status: "borrowed",
      authorId: 5,
      activeStatus: 1
    });

    expect(result.where).toBe("WHERE b.status = ? AND b.author_id = ? AND b.active_status = ?");
    expect(result.params).toEqual(["borrowed", 5, 1]);
  });

  it("filters by category", () => {
      const result = buildFilters({ category: "Fiction" });
      expect(result.where).toBe("WHERE b.category = ?");
      expect(result.params).toEqual(["Fiction"]);
  });
});
