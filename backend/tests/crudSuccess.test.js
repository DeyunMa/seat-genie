const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");

const dbFile = path.join(
  os.tmpdir(),
  `seat-genie-test-crud-success-${process.pid}-${Date.now()}.db`
);
process.env.DATABASE_FILE = dbFile;
process.env.LOG_LEVEL = "silent";

jest.mock("../src/middleware/auth", () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, role: "admin" };
    next();
  },
}));

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

describe("CRUD Success Scenarios", () => {
  it("manages authors lifecycle", async () => {
    // Create
    const createRes = await request(app)
      .post("/api/authors")
      .send({ name: "Jane Doe", bio: "A famous writer" })
      .expect(201);

    expect(createRes.body.data).toEqual(
      expect.objectContaining({ name: "Jane Doe", bio: "A famous writer" })
    );
    const authorId = createRes.body.data.id;

    // List
    const listRes = await request(app).get("/api/authors").expect(200);
    expect(listRes.body.data).toHaveLength(1);
    expect(listRes.body.data[0].id).toBe(authorId);

    // Get
    const getRes = await request(app).get(`/api/authors/${authorId}`).expect(200);
    expect(getRes.body.data.name).toBe("Jane Doe");

    // Update
    const updateRes = await request(app)
      .put(`/api/authors/${authorId}`)
      .send({ name: "Jane Smith", bio: "Updated bio" })
      .expect(200);
    expect(updateRes.body.data.name).toBe("Jane Smith");

    // Delete
    await request(app).delete(`/api/authors/${authorId}`).expect(204);
    await request(app).get(`/api/authors/${authorId}`).expect(404);
  });

  it("manages books lifecycle", async () => {
    // Setup Author
    const authorRes = await request(app)
      .post("/api/authors")
      .send({ name: "Author 1" });
    const authorId = authorRes.body.data.id;

    // Create Book
    const createRes = await request(app)
      .post("/api/books")
      .send({
        title: "Book 1",
        isbn: "1234567890",
        authorId: authorId,
        author: "Author 1",
        status: "available",
        publishedYear: 2021
      })
      .expect(201);

    expect(createRes.body.data).toEqual(
      expect.objectContaining({ title: "Book 1", isbn: "1234567890" })
    );
    const bookId = createRes.body.data.id;

    // List Books
    const listRes = await request(app).get("/api/books").expect(200);
    expect(listRes.body.data).toHaveLength(1);

    // Update Book
    const updateRes = await request(app)
      .put(`/api/books/${bookId}`)
      .send({
        title: "Book 1 Updated",
        isbn: "1234567890",
        authorId: authorId,
        author: "Author 1",
        status: "maintenance"
      })
      .expect(200);
    expect(updateRes.body.data.title).toBe("Book 1 Updated");
    expect(updateRes.body.data.status).toBe("maintenance");

    // Delete Book
    await request(app).delete(`/api/books/${bookId}`).expect(204);
    await request(app).get(`/api/books/${bookId}`).expect(404);
  });

  it("manages members lifecycle", async () => {
    // Create Member
    const createRes = await request(app)
      .post("/api/members")
      .send({ name: "Member 1", email: "member1@example.com" })
      .expect(201);

    expect(createRes.body.data.name).toBe("Member 1");
    const memberId = createRes.body.data.id;

    // List Members
    const listRes = await request(app).get("/api/members").expect(200);
    expect(listRes.body.data).toHaveLength(1);

    // Update Member
    const updateRes = await request(app)
      .put(`/api/members/${memberId}`)
      .send({ name: "Member 1 Updated", email: "member1@example.com" })
      .expect(200);
    expect(updateRes.body.data.name).toBe("Member 1 Updated");

    // Delete Member
    await request(app).delete(`/api/members/${memberId}`).expect(204);
    await request(app).get(`/api/members/${memberId}`).expect(404);
  });

  it("manages loans lifecycle", async () => {
     // Setup
    const authorRes = await request(app).post("/api/authors").send({ name: "A" });
    const bookRes = await request(app).post("/api/books").send({
      title: "B", isbn: "0000000001", authorId: authorRes.body.data.id, author: "A", status: "available"
    });
    const memberRes = await request(app).post("/api/members").send({ name: "M", email: "m@e.com" });

    const bookId = bookRes.body.data.id;
    const memberId = memberRes.body.data.id;

    // Create Loan
    const createRes = await request(app)
      .post("/api/loans")
      .send({
        bookId,
        memberId,
        dueAt: "2024-12-31T00:00:00.000Z"
      })
      .expect(201);

    const loanId = createRes.body.data.id;
    expect(createRes.body.data.book_id).toBe(bookId);

    // List Loans
    const listRes = await request(app).get("/api/loans").expect(200);
    expect(listRes.body.data).toHaveLength(1);

    // Update Loan (Return)
    const updateRes = await request(app)
      .put(`/api/loans/${loanId}`)
      .send({ returnedAt: "2024-06-01T00:00:00.000Z" })
      .expect(200);

    expect(updateRes.body.data.returned_at).toBe("2024-06-01T00:00:00.000Z");

    // Delete Loan
    await request(app).delete(`/api/loans/${loanId}`).expect(204);
    await request(app).get(`/api/loans/${loanId}`).expect(404);
  });
});
