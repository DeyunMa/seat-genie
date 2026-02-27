const fs = require("fs");
const os = require("os");
const path = require("path");

const dbFile = path.join(
  os.tmpdir(),
  `seat-genie-test-reservations-${process.pid}-${Date.now()}.db`
);
process.env.DATABASE_FILE = dbFile;
process.env.LOG_LEVEL = "silent";

const { getDb, closeDb } = require("../src/db");
const { checkConflict } = require("../src/services/reservationsService");

const schemaSql = fs.readFileSync(
  path.resolve(__dirname, "..", "sql", "schema.sql"),
  "utf8"
);

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
  const db = getDb();
  db.exec("DELETE FROM reservations;");
  db.exec("DELETE FROM seats;");
  db.exec("DELETE FROM rooms;");
  db.exec("DELETE FROM users;");
});

describe("Reservation Conflict Detection", () => {
  let userId;
  let seatId;
  let roomId;

  beforeEach(() => {
    const db = getDb();

    // Setup User
    const userRes = db.prepare("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?) RETURNING id").get("testuser", "pass", "Test User", "student");
    userId = userRes.id;

    // Setup Room & Seat
    const roomRes = db.prepare("INSERT INTO rooms (name) VALUES (?) RETURNING id").get("Room A");
    roomId = roomRes.id;
    const seatRes = db.prepare("INSERT INTO seats (room_id, seat_number) VALUES (?, ?) RETURNING id").get(roomId, "A1");
    seatId = seatRes.id;
  });

  const createReservation = (date, startTime, endTime) => {
    const db = getDb();
    return db.prepare(`
      INSERT INTO reservations (user_id, seat_id, date, start_time, end_time, status)
      VALUES (?, ?, ?, ?, ?, 'active')
      RETURNING id
    `).get(userId, seatId, date, startTime, endTime);
  };

  it("should return false when no reservations exist", () => {
    const conflict = checkConflict(seatId, "2024-01-01", "10:00", "12:00");
    expect(conflict).toBe(false);
  });

  it("should return false for different seat", () => {
    createReservation("2024-01-01", "10:00", "12:00");
    const db = getDb();
    const otherSeatRes = db.prepare("INSERT INTO seats (room_id, seat_number) VALUES (?, ?) RETURNING id").get(roomId, "A2");

    const conflict = checkConflict(otherSeatRes.id, "2024-01-01", "10:00", "12:00");
    expect(conflict).toBe(false);
  });

  it("should return false for different date", () => {
    createReservation("2024-01-01", "10:00", "12:00");
    const conflict = checkConflict(seatId, "2024-01-02", "10:00", "12:00");
    expect(conflict).toBe(false);
  });

  it("should return false for time slot completely before", () => {
    createReservation("2024-01-01", "10:00", "12:00");
    const conflict = checkConflict(seatId, "2024-01-01", "08:00", "10:00");
    expect(conflict).toBe(false);
  });

  it("should return false for time slot completely after", () => {
    createReservation("2024-01-01", "10:00", "12:00");
    const conflict = checkConflict(seatId, "2024-01-01", "12:00", "14:00");
    expect(conflict).toBe(false);
  });

  it("should return true for exact match", () => {
    createReservation("2024-01-01", "10:00", "12:00");
    const conflict = checkConflict(seatId, "2024-01-01", "10:00", "12:00");
    expect(conflict).toBe(true);
  });

  it("should return true for partial overlap at start", () => {
    createReservation("2024-01-01", "10:00", "12:00");
    const conflict = checkConflict(seatId, "2024-01-01", "09:00", "11:00");
    expect(conflict).toBe(true);
  });

  it("should return true for partial overlap at end", () => {
    createReservation("2024-01-01", "10:00", "12:00");
    const conflict = checkConflict(seatId, "2024-01-01", "11:00", "13:00");
    expect(conflict).toBe(true);
  });

  it("should return true for contained overlap", () => {
    createReservation("2024-01-01", "10:00", "12:00");
    const conflict = checkConflict(seatId, "2024-01-01", "10:30", "11:30");
    expect(conflict).toBe(true);
  });

  it("should return true for enveloping overlap", () => {
    createReservation("2024-01-01", "10:00", "12:00");
    const conflict = checkConflict(seatId, "2024-01-01", "09:00", "13:00");
    expect(conflict).toBe(true);
  });

  it("should ignore cancelled reservations", () => {
     const db = getDb();
     db.prepare(`
      INSERT INTO reservations (user_id, seat_id, date, start_time, end_time, status)
      VALUES (?, ?, ?, ?, ?, 'cancelled')
    `).run(userId, seatId, "2024-01-01", "10:00", "12:00");

    const conflict = checkConflict(seatId, "2024-01-01", "10:00", "12:00");
    expect(conflict).toBe(false);
  });

  it("should allow update of existing reservation (excludeId)", () => {
    const res = createReservation("2024-01-01", "10:00", "12:00");
    const conflict = checkConflict(seatId, "2024-01-01", "10:00", "12:00", res.id);
    expect(conflict).toBe(false);
  });

  it("should return true if updating reservation conflicts with another", () => {
    const res1 = createReservation("2024-01-01", "10:00", "12:00");
    const res2 = createReservation("2024-01-01", "12:00", "14:00"); // Just adjacent, legal

    // Try to update res2 to overlap with res1
    const conflict = checkConflict(seatId, "2024-01-01", "11:00", "13:00", res2.id);
    expect(conflict).toBe(true);
  });
});
