const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");

const dbFile = path.join(
  os.tmpdir(),
  `seat-genie-test-users-${process.pid}-${Date.now()}.db`
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

const app = createApp();

beforeAll(() => {
  // getDb() auto-initializes schema + seed on first call
  getDb();
});

afterAll(() => {
  closeDb();
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
});

describe("POST /api/users/login", () => {
  it("returns 401 for invalid credentials", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ username: "admin", password: "wrong" });
    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 401 for non-existent user", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ username: "nonexistent", password: "TempPass123!" });
    expect(res.statusCode).toBe(401);
  });

  it("returns 400 for missing fields", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ username: "" });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/users", () => {
  it("returns list of users", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
  });

  it("filters users by role", async () => {
    const res = await request(app).get("/api/users?role=admin");
    expect(res.statusCode).toBe(200);
    res.body.data.forEach((u) => expect(u.role).toBe("admin"));
  });

  it("supports pagination", async () => {
    const res = await request(app).get("/api/users?limit=2&offset=0");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.meta.limit).toBe(2);
    expect(res.body.meta.offset).toBe(0);
  });

  it("excludes passwords from response", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
    res.body.data.forEach((u) => expect(u.password).toBeUndefined());
  });
});

describe("GET /api/users/:id", () => {
  it("returns a user by id", async () => {
    const res = await request(app).get("/api/users/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(1);
    expect(res.body.data.password).toBeUndefined();
  });

  it("returns 404 for non-existent user", async () => {
    const res = await request(app).get("/api/users/9999");
    expect(res.statusCode).toBe(404);
  });

  it("returns 400 for invalid id", async () => {
    const res = await request(app).get("/api/users/abc");
    expect(res.statusCode).toBe(400);
  });
});

describe("POST /api/users", () => {
  it("creates a new user", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({
        username: "newuser_test",
        password: "StrongPass123!",
        name: "Test User",
        role: "student",
        email: "newuser_test@test.edu",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.username).toBe("newuser_test");
    expect(res.body.data.password).toBeUndefined();
  });

  it("returns 409 for duplicate username", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({
        username: "newuser_test",
        password: "StrongPass123!",
        name: "Dup User",
        role: "student",
      });
    expect(res.statusCode).toBe(409);
  });

  it("returns 400 for weak password", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({
        username: "weakpw_user",
        password: "short",
        name: "Weak PW",
        role: "student",
      });
    expect(res.statusCode).toBe(400);
  });
});

describe("PUT /api/users/:id", () => {
  it("updates user name", async () => {
    const res = await request(app)
      .put("/api/users/1")
      .send({ name: "Updated Admin" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe("Updated Admin");
  });

  it("returns 404 for non-existent user", async () => {
    const res = await request(app)
      .put("/api/users/9999")
      .send({ name: "Ghost" });
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /api/users/:id", () => {
  let tempUserId;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/users")
      .send({
        username: "to_delete_user",
        password: "StrongPass123!",
        name: "Delete Me",
        role: "student",
      });
    tempUserId = res.body.data.id;
  });

  it("soft-deletes a user", async () => {
    const res = await request(app).delete(`/api/users/${tempUserId}`);
    expect(res.statusCode).toBe(204);
  });

  it("returns 404 after deletion", async () => {
    const res = await request(app).get(`/api/users/${tempUserId}`);
    expect(res.statusCode).toBe(404);
  });
});
