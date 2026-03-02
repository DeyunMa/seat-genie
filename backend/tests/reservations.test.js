const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");

const dbFile = path.join(
  os.tmpdir(),
  `seat-genie-test-reservations-${process.pid}-${Date.now()}.db`
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
let reservationId;

beforeAll(async () => {
  const db = getDb();
  db.exec(schemaSql);
  db.exec(`INSERT INTO users (username, password, name, role, email, active_status, created_at, updated_at)
    VALUES ('resuser', 'hash', 'Res User', 'student', 'res@test.edu', 'Y', datetime('now'), datetime('now'))`);

  const roomRes = await request(app)
    .post("/api/rooms")
    .send({ name: "Reservation Room", floor: 1, capacity: 10 });
  roomId = roomRes.body.data.id;

  const seatRes = await request(app)
    .post("/api/seats")
    .send({ roomId, seatNumber: "R01", status: "available" });
  seatId = seatRes.body.data.id;
});

afterAll(() => {
  closeDb();
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
});

describe("POST /api/reservations", () => {
  it("creates a reservation", async () => {
    const res = await request(app)
      .post("/api/reservations")
      .send({
        userId: 1,
        seatId,
        date: "2026-06-15",
        startTime: "09:00",
        endTime: "12:00",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.seatId).toBe(seatId);
    expect(res.body.data.status).toBe("active");
    reservationId = res.body.data.id;
  });

  it("returns 409 for conflicting time slot", async () => {
    const res = await request(app)
      .post("/api/reservations")
      .send({
        userId: 1,
        seatId,
        date: "2026-06-15",
        startTime: "10:00",
        endTime: "11:00",
      });
    expect(res.statusCode).toBe(409);
  });

  it("allows non-overlapping time slot", async () => {
    const res = await request(app)
      .post("/api/reservations")
      .send({
        userId: 1,
        seatId,
        date: "2026-06-15",
        startTime: "14:00",
        endTime: "16:00",
      });
    expect(res.statusCode).toBe(201);
  });
});

describe("GET /api/reservations", () => {
  it("returns list of reservations", async () => {
    const res = await request(app).get("/api/reservations");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it("filters by seatId", async () => {
    const res = await request(app).get(`/api/reservations?seatId=${seatId}`);
    expect(res.statusCode).toBe(200);
    res.body.data.forEach((r) => expect(r.seatId).toBe(seatId));
  });

  it("filters by date", async () => {
    const res = await request(app).get("/api/reservations?date=2026-06-15");
    expect(res.statusCode).toBe(200);
    res.body.data.forEach((r) => expect(r.date).toBe("2026-06-15"));
  });
});

describe("GET /api/reservations/:id", () => {
  it("returns a reservation by id", async () => {
    const res = await request(app).get(`/api/reservations/${reservationId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(reservationId);
  });

  it("returns 404 for non-existent reservation", async () => {
    const res = await request(app).get("/api/reservations/9999");
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /api/reservations/:id/cancel", () => {
  it("cancels a reservation", async () => {
    const res = await request(app).post(`/api/reservations/${reservationId}/cancel`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("cancelled");
  });

  it("returns 404 for non-existent reservation", async () => {
    const res = await request(app).post("/api/reservations/9999/cancel");
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /api/reservations/:id", () => {
  let deleteId;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/reservations")
      .send({
        userId: 1,
        seatId,
        date: "2026-07-01",
        startTime: "10:00",
        endTime: "12:00",
      });
    deleteId = res.body.data.id;
  });

  it("deletes a reservation", async () => {
    const res = await request(app).delete(`/api/reservations/${deleteId}`);
    expect(res.statusCode).toBe(204);
  });

  it("returns 404 after deletion", async () => {
    const res = await request(app).get(`/api/reservations/${deleteId}`);
    expect(res.statusCode).toBe(404);
  });
});
