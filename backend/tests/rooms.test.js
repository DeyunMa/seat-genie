const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");

const dbFile = path.join(
  os.tmpdir(),
  `seat-genie-test-rooms-${process.pid}-${Date.now()}.db`
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

beforeAll(() => {
  const db = getDb();
  db.exec(schemaSql);
});

afterAll(() => {
  closeDb();
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
});

let roomId;

describe("POST /api/rooms", () => {
  it("creates a room", async () => {
    const res = await request(app)
      .post("/api/rooms")
      .send({ name: "Test Room", floor: 1, capacity: 30, openTime: "08:00", closeTime: "22:00" });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe("Test Room");
    expect(res.body.data.capacity).toBe(30);
    roomId = res.body.data.id;
  });

  it("returns 400 for missing name", async () => {
    const res = await request(app)
      .post("/api/rooms")
      .send({ floor: 1 });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/rooms", () => {
  it("returns list of rooms", async () => {
    const res = await request(app).get("/api/rooms");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
  });

  it("supports pagination", async () => {
    const res = await request(app).get("/api/rooms?limit=1&offset=0");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(1);
  });
});

describe("GET /api/rooms/:id", () => {
  it("returns a room by id", async () => {
    const res = await request(app).get(`/api/rooms/${roomId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(roomId);
  });

  it("returns 404 for non-existent room", async () => {
    const res = await request(app).get("/api/rooms/9999");
    expect(res.statusCode).toBe(404);
  });

  it("returns 400 for invalid id", async () => {
    const res = await request(app).get("/api/rooms/abc");
    expect(res.statusCode).toBe(400);
  });
});

describe("PUT /api/rooms/:id", () => {
  it("updates room capacity", async () => {
    const res = await request(app)
      .put(`/api/rooms/${roomId}`)
      .send({ capacity: 50 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.capacity).toBe(50);
  });

  it("returns 404 for non-existent room", async () => {
    const res = await request(app)
      .put("/api/rooms/9999")
      .send({ capacity: 10 });
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /api/rooms/:id", () => {
  let deleteRoomId;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/rooms")
      .send({ name: "To Delete", floor: 2, capacity: 10 });
    deleteRoomId = res.body.data.id;
  });

  it("soft-deletes a room", async () => {
    const res = await request(app).delete(`/api/rooms/${deleteRoomId}`);
    expect(res.statusCode).toBe(204);
  });

  it("returns 404 for deleted room", async () => {
    const res = await request(app).get(`/api/rooms/${deleteRoomId}`);
    expect(res.statusCode).toBe(404);
  });
});
