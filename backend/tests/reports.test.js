const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");

const dbFile = path.join(
  os.tmpdir(),
  `seat-genie-test-reports-${process.pid}-${Date.now()}.db`
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

const createMember = async (name, email) => {
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
  return response.body.data;
};

const returnLoan = async ({ loanId, returnedAt }) => {
  const response = await request(app).put(`/api/loans/${loanId}`).send({
    returnedAt,
  });
  return response.body.data;
};

const seedReportData = async () => {
  const author = await createAuthor();
  const memberA = await createMember("Ava Li", "ava@example.com");
  const memberB = await createMember("Ben Wu", "ben@example.com");

  const bookA = await createBook({
    title: "Echoes of the Stack",
    isbn: "9780000000101",
    authorId: author.id,
    status: "available",
  });
  const bookB = await createBook({
    title: "Middleware Dreams",
    isbn: "9780000000102",
    authorId: author.id,
    status: "available",
  });
  const bookC = await createBook({
    title: "Lost in the Index",
    isbn: "9780000000103",
    authorId: author.id,
    status: "lost",
  });
  const bookD = await createBook({
    title: "Returned Pages",
    isbn: "9780000000104",
    authorId: author.id,
    status: "available",
  });

  const overdueLoan = await createLoan({
    bookId: bookA.id,
    memberId: memberA.id,
    dueAt: "2024-01-05T00:00:00.000Z",
  });

  const openLoan = await createLoan({
    bookId: bookB.id,
    memberId: memberA.id,
    dueAt: "2024-01-15T00:00:00.000Z",
  });

  const returnedLoan = await createLoan({
    bookId: bookD.id,
    memberId: memberB.id,
    dueAt: "2024-01-12T00:00:00.000Z",
  });

  await returnLoan({
    loanId: returnedLoan.id,
    returnedAt: "2024-01-10T00:00:00.000Z",
  });

  return {
    author,
    memberA,
    memberB,
    bookA,
    bookB,
    bookC,
    bookD,
    overdueLoan,
    openLoan,
    returnedLoan,
  };
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

describe("reports endpoints", () => {
  it("returns overdue loans with days overdue", async () => {
    await seedReportData();

    const response = await request(app)
      .get("/api/reports/overdue-loans?asOf=2024-01-10T00:00:00.000Z")
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        book_title: "Echoes of the Stack",
        member_name: "Ava Li",
        days_overdue: 5,
      })
    );
  });

  it("returns most active members with limit and status metadata", async () => {
    await seedReportData();

    const response = await request(app)
      .get("/api/reports/most-active-members?limit=1&status=open")
      .expect(200);

    expect(response.body.meta).toEqual({
      limit: 1,
      since: null,
      status: "open",
    });
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        name: "Ava Li",
        loan_count: 2,
      })
    );
  });

  it("returns most borrowed books with author info", async () => {
    await seedReportData();

    const response = await request(app)
      .get("/api/reports/most-borrowed-books?limit=2")
      .expect(200);

    expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        author_name: "Nova Hart",
      })
    );
  });

  it("returns inventory health breakdown", async () => {
    await seedReportData();

    const response = await request(app)
      .get("/api/reports/inventory-health?asOf=2024-01-10T00:00:00.000Z")
      .expect(200);

    expect(response.body.data).toEqual({
      totalBooks: 4,
      statusCounts: {
        available: 1,
        checkedOut: 2,
        lost: 1,
      },
      overdue: {
        loans: 1,
        books: 1,
      },
    });
    expect(response.body.meta.asOf).toBe("2024-01-10T00:00:00.000Z");
  });

  it("returns member loan history with pagination metadata", async () => {
    const { memberA } = await seedReportData();

    const response = await request(app)
      .get(`/api/reports/member-loan-history/${memberA.id}?limit=1&offset=0`)
      .expect(200);

    expect(response.body.data.member).toEqual(
      expect.objectContaining({
        id: memberA.id,
        name: "Ava Li",
      })
    );
    expect(response.body.data.loans).toHaveLength(1);
    expect(response.body.meta).toEqual(
      expect.objectContaining({
        total: 2,
        limit: 1,
        offset: 0,
        since: null,
        until: null,
        status: null,
      })
    );
  });

  it("returns book loan history for a specific book", async () => {
    const { bookA } = await seedReportData();

    const response = await request(app)
      .get(`/api/reports/book-loan-history/${bookA.id}`)
      .expect(200);

    expect(response.body.data.book).toEqual(
      expect.objectContaining({
        id: bookA.id,
        title: "Echoes of the Stack",
      })
    );
    expect(response.body.data.loans).toHaveLength(1);
    expect(response.body.meta.total).toBe(1);
  });
});

describe("reports validation", () => {
  it("rejects invalid date query parameters", async () => {
    const response = await request(app)
      .get("/api/reports/overdue-loans?asOf=not-a-date")
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        code: "VALIDATION_ERROR",
        error: "Validation failed",
      })
    );
  });

  it("rejects out-of-range report limits", async () => {
    const response = await request(app)
      .get("/api/reports/most-active-members?limit=200")
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        code: "VALIDATION_ERROR",
        error: "Validation failed",
      })
    );
  });

  it("rejects invalid status filters", async () => {
    const response = await request(app)
      .get("/api/reports/most-borrowed-books?status=invalid")
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        code: "VALIDATION_ERROR",
        error: "Validation failed",
      })
    );
  });

  it("rejects since after until on history endpoints", async () => {
    const response = await request(app)
      .get(
        "/api/reports/member-loan-history/1?since=2024-02-10T00:00:00.000Z&until=2024-01-01T00:00:00.000Z"
      )
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        code: "VALIDATION_ERROR",
        error: "Validation failed",
      })
    );
  });
});
