const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");

const dbFile = path.join(
  os.tmpdir(),
  `seat-genie-test-seats-${process.pid}-${Date.now()}.db`
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
let roomId;
let seatId;

beforeAll(async () => {
  const db = getDb();
  db.exec(schemaSql);
  const res = await request(app)
    .post("/api/rooms")
    .send({ name: "Seat Test Room", floor: 1, capacity: 20 });
  roomId = res.body.data.id;
});

afterAll(() => {
  closeDb();
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
});

describe("POST /api/seats", () => {
  it("creates a seat", async () => {
    const res = await request(app)
      .post("/api/seats")
      .send({ roomId, seatNumber: "T01", status: "available" });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.seatNumber).toBe("T01");
    expect(res.body.data.roomId).toBe(roomId);
    seatId = res.body.data.id;
  });

  it("creates multiple seats", async () => {
    for (const num of ["T02", "T03"]) {
      const res = await request(app)
        .post("/api/seats")
        .send({ roomId, seatNumber: num, status: "available" });
      expect(res.statusCode).toBe(201);
    }
  });
});

describe("GET /api/seats", () => {
  it("returns list of seats", async () => {
    const res = await request(app).get("/api/seats");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
  });

  it("filters by roomId", async () => {
    const res = await request(app).get(`/api/seats?roomId=${roomId}`);
    expect(res.statusCode).toBe(200);
    res.body.data.forEach((s) => expect(s.roomId).toBe(roomId));
  });
});

describe("GET /api/seats/:id", () => {
  it("returns a seat by id", async () => {
    const res = await request(app).get(`/api/seats/${seatId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(seatId);
  });

  it("returns 404 for non-existent seat", async () => {
    const res = await request(app).get("/api/seats/9999");
    expect(res.statusCode).toBe(404);
  });
});

describe("PUT /api/seats/:id", () => {
  it("updates seat status", async () => {
    const res = await request(app)
      .put(`/api/seats/${seatId}`)
      .send({ status: "maintenance" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("maintenance");
  });
});

describe("DELETE /api/seats/:id", () => {
  let deleteSeatId;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/seats")
      .send({ roomId, seatNumber: "DEL01", status: "available" });
    deleteSeatId = res.body.data.id;
  });

  it("soft-deletes a seat", async () => {
    const res = await request(app).delete(`/api/seats/${deleteSeatId}`);
    expect(res.statusCode).toBe(204);
  });

  it("returns 404 for deleted seat", async () => {
    const res = await request(app).get(`/api/seats/${deleteSeatId}`);
    expect(res.statusCode).toBe(404);
  });
});
