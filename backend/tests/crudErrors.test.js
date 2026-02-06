const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");

const dbFile = path.join(
  os.tmpdir(),
  `seat-genie-test-crud-errors-${process.pid}-${Date.now()}.db`
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

const createAuthor = async (name = "Nova Hart") => {
  const response = await request(app).post("/api/authors").send({
    name,
    bio: null,
  });
  return response.body.data;
};

const createMember = async (name = "Ava Li", email = "ava@example.com") => {
  const response = await request(app).post("/api/members").send({
    name,
    email,
    phone: null,
  });
  return response.body.data;
};

const createBook = async ({ title, isbn, authorId, status }) => {
  const response = await request(app).post("/api/books").send({
    title,
    isbn,
    authorId,
    publishedYear: 2022,
    status,
  });
  return response.body.data;
};

const createLoan = async ({ bookId, memberId, dueAt }) => {
  const response = await request(app).post("/api/loans").send({
    bookId,
    memberId,
    dueAt,
  });
  return response.body;
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

describe("CRUD error scenarios", () => {
  it("rejects invalid ids across core resources", async () => {
    const bookResponse = await request(app)
      .get("/api/books/abc")
      .expect(400);
    expect(bookResponse.body).toEqual(
      expect.objectContaining({
        code: "INVALID_ID",
        error: "Invalid book id",
      })
    );

    const authorResponse = await request(app)
      .get("/api/authors/0")
      .expect(400);
    expect(authorResponse.body).toEqual(
      expect.objectContaining({
        code: "INVALID_ID",
        error: "Invalid author id",
      })
    );

    const memberResponse = await request(app)
      .get("/api/members/-3")
      .expect(400);
    expect(memberResponse.body).toEqual(
      expect.objectContaining({
        code: "INVALID_ID",
        error: "Invalid member id",
      })
    );

    const loanResponse = await request(app)
      .get("/api/loans/not-a-number")
      .expect(400);
    expect(loanResponse.body).toEqual(
      expect.objectContaining({
        code: "INVALID_ID",
        error: "Invalid loan id",
      })
    );
  });

  it("returns not found for missing records", async () => {
    const bookResponse = await request(app)
      .get("/api/books/999")
      .expect(404);
    expect(bookResponse.body).toEqual(
      expect.objectContaining({
        code: "NOT_FOUND",
        error: "Book not found",
      })
    );

    const authorResponse = await request(app)
      .put("/api/authors/999")
      .send({ name: "Ghost", bio: null })
      .expect(404);
    expect(authorResponse.body).toEqual(
      expect.objectContaining({
        code: "NOT_FOUND",
        error: "Author not found",
      })
    );

    const memberResponse = await request(app)
      .delete("/api/members/999")
      .expect(404);
    expect(memberResponse.body).toEqual(
      expect.objectContaining({
        code: "NOT_FOUND",
        error: "Member not found",
      })
    );

    const loanResponse = await request(app)
      .put("/api/loans/999")
      .send({ returnedAt: "2024-01-10T00:00:00.000Z" })
      .expect(404);
    expect(loanResponse.body).toEqual(
      expect.objectContaining({
        code: "NOT_FOUND",
        error: "Loan not found",
      })
    );
  });

  it("rejects loan creation when book or member is missing", async () => {
    const member = await createMember();

    const missingBook = await createLoan({
      bookId: 999,
      memberId: member.id,
      dueAt: "2024-01-15T00:00:00.000Z",
    });
    expect(missingBook).toEqual(
      expect.objectContaining({
        code: "NOT_FOUND",
        error: "Book not found",
      })
    );

    const author = await createAuthor();
    const book = await createBook({
      title: "Echoes of the Stack",
      isbn: "9780000000101",
      authorId: author.id,
      status: "available",
    });

    const missingMember = await createLoan({
      bookId: book.id,
      memberId: 999,
      dueAt: "2024-01-15T00:00:00.000Z",
    });
    expect(missingMember).toEqual(
      expect.objectContaining({
        code: "NOT_FOUND",
        error: "Member not found",
      })
    );
  });

  it("rejects loan creation when book is unavailable", async () => {
    const author = await createAuthor();
    const member = await createMember();
    const book = await createBook({
      title: "Checked Out Tales",
      isbn: "9780000000102",
      authorId: author.id,
      status: "checked_out",
    });

    const response = await request(app)
      .post("/api/loans")
      .send({
        bookId: book.id,
        memberId: member.id,
        dueAt: "2024-01-15T00:00:00.000Z",
      })
      .expect(409);

    expect(response.body).toEqual(
      expect.objectContaining({
        code: "CONFLICT",
        error: "Book not available",
      })
    );
  });

  it("blocks member deletion with active loans", async () => {
    const author = await createAuthor();
    const member = await createMember();
    const book = await createBook({
      title: "Open Loan",
      isbn: "9780000000103",
      authorId: author.id,
      status: "available",
    });

    const loanResponse = await request(app)
      .post("/api/loans")
      .send({
        bookId: book.id,
        memberId: member.id,
        dueAt: "2024-01-15T00:00:00.000Z",
      })
      .expect(201);

    expect(loanResponse.body.data).toEqual(
      expect.objectContaining({
        member_id: member.id,
      })
    );

    const deleteResponse = await request(app)
      .delete(`/api/members/${member.id}`)
      .expect(409);

    expect(deleteResponse.body).toEqual(
      expect.objectContaining({
        code: "CONFLICT",
        error: "Member has active loans",
      })
    );
  });
});
