const {
  buildErrorPayload,
  AppError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  sendInvalidId,
  sendNotFound,
  sendConflict,
} = require("../src/utils/errors");

describe("Error Classes", () => {
  describe("AppError", () => {
    it("sets default properties correctly", () => {
      const error = new AppError("Something went wrong");
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Something went wrong");
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe("INTERNAL_ERROR");
    });

    it("allows overriding status code and error code", () => {
      const error = new AppError("Custom Error", 418, "TEAPOT");
      expect(error.message).toBe("Custom Error");
      expect(error.statusCode).toBe(418);
      expect(error.code).toBe("TEAPOT");
    });
  });

  describe("NotFoundError", () => {
    it("sets correct defaults", () => {
      const error = new NotFoundError();
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Not found");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
    });

    it("allows custom message", () => {
      const error = new NotFoundError("User not found");
      expect(error.message).toBe("User not found");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
    });
  });

  describe("ConflictError", () => {
    it("sets correct defaults", () => {
      const error = new ConflictError();
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Conflict");
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe("CONFLICT");
    });

    it("allows custom message", () => {
      const error = new ConflictError("Email already exists");
      expect(error.message).toBe("Email already exists");
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe("CONFLICT");
    });
  });

  describe("UnauthorizedError", () => {
    it("sets correct defaults", () => {
      const error = new UnauthorizedError();
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Unauthorized");
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("UNAUTHORIZED");
    });

    it("allows custom message", () => {
      const error = new UnauthorizedError("Token invalid");
      expect(error.message).toBe("Token invalid");
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("UNAUTHORIZED");
    });
  });
});

describe("buildErrorPayload", () => {
  it("returns a payload with only a message", () => {
    const input = { message: "Something went wrong" };
    const result = buildErrorPayload(input);
    expect(result).toEqual({ error: "Something went wrong" });
  });

  it("includes the code if provided", () => {
    const input = { message: "Invalid ID", code: "INVALID_ID" };
    const result = buildErrorPayload(input);
    expect(result).toEqual({
      error: "Invalid ID",
      code: "INVALID_ID",
    });
  });

  it("includes details if provided", () => {
    const input = {
      message: "Validation Error",
      details: ["Field is required"],
    };
    const result = buildErrorPayload(input);
    expect(result).toEqual({
      error: "Validation Error",
      details: ["Field is required"],
    });
  });

  it("includes both code and details if provided", () => {
    const input = {
      message: "Complex Error",
      code: "COMPLEX_ERR",
      details: { foo: "bar" },
    };
    const result = buildErrorPayload(input);
    expect(result).toEqual({
      error: "Complex Error",
      code: "COMPLEX_ERR",
      details: { foo: "bar" },
    });
  });

  it("includes details when value is falsy but not undefined", () => {
    const falsyValues = [null, false, 0, ""];
    falsyValues.forEach((val) => {
      const input = { message: "Falsy Details", details: val };
      const result = buildErrorPayload(input);
      expect(result).toEqual({
        error: "Falsy Details",
        details: val,
      });
    });
  });

  it("does not include details when value is undefined", () => {
    const input = { message: "Undefined Details", details: undefined };
    const result = buildErrorPayload(input);
    expect(result).toEqual({
      error: "Undefined Details",
    });
    expect(result).not.toHaveProperty("details");
  });
});

describe("Response Helpers", () => {
  let res;
  let jsonMock;

  beforeEach(() => {
    jsonMock = jest.fn();
    res = {
      status: jest.fn().mockReturnValue({ json: jsonMock }),
    };
  });

  describe("sendInvalidId", () => {
    it("sends 400 with correct payload", () => {
      sendInvalidId(res, "book");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Invalid book id",
        code: "INVALID_ID",
      });
    });
  });

  describe("sendNotFound", () => {
    it("sends 404 with correct payload", () => {
      sendNotFound(res, "User");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "User not found",
        code: "NOT_FOUND",
      });
    });
  });

  describe("sendConflict", () => {
    it("sends 409 with correct payload", () => {
      sendConflict(res, "Duplicate entry");
      expect(res.status).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Duplicate entry",
        code: "CONFLICT",
      });
    });
  });
});
