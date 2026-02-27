const { checkConflict } = require("../src/services/reservationsService");
const { getDb } = require("../src/db");

jest.mock("../src/db", () => ({
  getDb: jest.fn(),
}));

describe("reservationsService - checkConflict (Unit)", () => {
  let mockDb;
  let mockPrepare;
  let mockAll;

  beforeEach(() => {
    mockAll = jest.fn();
    mockPrepare = jest.fn(() => ({ all: mockAll }));
    mockDb = { prepare: mockPrepare };
    getDb.mockReturnValue(mockDb);
    jest.clearAllMocks();
  });

  it("should return false when no conflicts are found", () => {
    mockAll.mockReturnValue([]);
    const result = checkConflict(1, "2024-01-01", "10:00", "11:00");
    expect(result).toBe(false);
    expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining("SELECT * FROM reservations"));
  });

  it("should return true when conflicts are found", () => {
    mockAll.mockReturnValue([{ id: 1 }]);
    const result = checkConflict(1, "2024-01-01", "10:00", "11:00");
    expect(result).toBe(true);
  });

  it("should include excludeId in SQL and params when provided", () => {
    mockAll.mockReturnValue([]);
    checkConflict(1, "2024-01-01", "10:00", "11:00", 999);

    // Verify SQL contains the exclusion clause
    expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining("AND id != ?"));

    // Verify parameters include the excluded ID at the end
    // New implementation: seatId, date, startTime, endTime, excludeId
    const callArgs = mockAll.mock.calls[0];
    expect(callArgs.length).toBe(5);
    expect(callArgs[callArgs.length - 1]).toBe(999);
  });
});
