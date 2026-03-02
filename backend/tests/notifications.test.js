const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");

const dbFile = path.join(
  os.tmpdir(),
  `seat-genie-test-notifs-${process.pid}-${Date.now()}.db`
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
let notifId;

beforeAll(() => {
  const db = getDb();
  db.exec(schemaSql);
  db.exec(`INSERT INTO users (username, password, name, role, email, active_status, created_at, updated_at)
    VALUES ('notifuser', 'hash', 'Notif User', 'admin', 'notif@test.edu', 'Y', datetime('now'), datetime('now'))`);
});

afterAll(() => {
  closeDb();
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
});

describe("POST /api/notifications", () => {
  it("creates a notification", async () => {
    const res = await request(app)
      .post("/api/notifications")
      .send({
        title: "Test Notice",
        content: "This is a test notification",
        type: "announcement",
        createdBy: 1,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe("Test Notice");
    notifId = res.body.data.id;
  });

  it("creates a system notification", async () => {
    const res = await request(app)
      .post("/api/notifications")
      .send({
        title: "System Alert",
        content: "System maintenance scheduled",
        type: "system",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.type).toBe("system");
  });

  it("returns 400 for missing title", async () => {
    const res = await request(app)
      .post("/api/notifications")
      .send({ content: "No title" });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/notifications", () => {
  it("returns list of notifications", async () => {
    const res = await request(app).get("/api/notifications");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it("filters by type", async () => {
    const res = await request(app).get("/api/notifications?type=system");
    expect(res.statusCode).toBe(200);
    res.body.data.forEach((n) => expect(n.type).toBe("system"));
  });
});

describe("GET /api/notifications/:id", () => {
  it("returns a notification by id", async () => {
    const res = await request(app).get(`/api/notifications/${notifId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(notifId);
  });

  it("returns 404 for non-existent notification", async () => {
    const res = await request(app).get("/api/notifications/9999");
    expect(res.statusCode).toBe(404);
  });
});

describe("PUT /api/notifications/:id", () => {
  it("updates notification title", async () => {
    const res = await request(app)
      .put(`/api/notifications/${notifId}`)
      .send({ title: "Updated Notice" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe("Updated Notice");
  });

  it("returns 404 for non-existent notification", async () => {
    const res = await request(app)
      .put("/api/notifications/9999")
      .send({ title: "Ghost" });
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /api/notifications/:id/read", () => {
  it("marks a notification as read", async () => {
    const res = await request(app)
      .post(`/api/notifications/${notifId}/read`)
      .send({ userId: 1 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.success).toBe(true);
  });
});

describe("GET /api/notifications/unread/count", () => {
  it("returns unread count", async () => {
    const res = await request(app).get("/api/notifications/unread/count?userId=1");
    expect(res.statusCode).toBe(200);
    expect(typeof res.body.data.count).toBe("number");
  });
});

describe("DELETE /api/notifications/:id", () => {
  let deleteNotifId;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/notifications")
      .send({ title: "To Delete", content: "Will be deleted" });
    deleteNotifId = res.body.data.id;
  });

  it("soft-deletes a notification", async () => {
    const res = await request(app).delete(`/api/notifications/${deleteNotifId}`);
    expect(res.statusCode).toBe(204);
  });

  it("returns 404 for deleted notification", async () => {
    const res = await request(app).get(`/api/notifications/${deleteNotifId}`);
    expect(res.statusCode).toBe(404);
  });
});
