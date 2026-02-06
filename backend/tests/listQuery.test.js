const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");

const dbFile = path.join(
  os.tmpdir(),
  `seat-genie-test-${process.pid}-${Date.now()}.db`
);
process.env.DATABASE_FILE = dbFile;
process.env.LOG_LEVEL = "silent";

const { createApp } = require("../src/app");
const { getDb, closeDb } = require("../src/db");

const schemaSql = fs.readFileSync(
  path.resolve(__dirname, "..", "sql", "schema.sql"),
  "utf8"
);

const app = createApp();

const clearTables = () => {
  const db = getDb();
  db.exec("DELETE FROM loans;");
  db.exec("DELETE FROM books;");
  db.exec("DELETE FROM authors;");
  db.exec("DELETE FROM members;");
};

const seedBooks = async () => {
  await request(app).post("/api/books").send({
    title: "Indexing the Stars",
    isbn: "9780000000001",
    publishedYear: 2020,
    status: "available",
  });

  await request(app).post("/api/books").send({
    title: "The Quiet Library",
    isbn: "9780000000002",
    publishedYear: 2021,
    status: "available",
  });

  await request(app).post("/api/books").send({
    title: "Night Pages",
    isbn: "9780000000003",
    publishedYear: 2019,
    status: "available",
  });
};

afterAll(() => {
  closeDb();
  if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);
  }
});

beforeAll(() => {
  const db = getDb();
  db.exec(schemaSql);
});

beforeEach(() => {
  clearTables();
});

describe("list query middleware", () => {
  it("returns pagination metadata from list endpoints", async () => {
    await seedBooks();

    const response = await request(app)
      .get("/api/books?limit=2&offset=1")
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        data: expect.any(Array),
        meta: expect.objectContaining({
          total: 3,
          limit: 2,
          offset: 1,
        }),
      })
    );
    expect(response.body.data).toHaveLength(2);
  });

  it("rejects invalid pagination parameters", async () => {
    const response = await request(app)
      .get("/api/books?limit=0")
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        code: "VALIDATION_ERROR",
        error: "Validation failed",
      })
    );
  });

  it("rejects invalid list query values on other endpoints", async () => {
    const response = await request(app)
      .get("/api/loans?status=invalid")
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        code: "VALIDATION_ERROR",
        error: "Validation failed",
      })
    );
  });
});
