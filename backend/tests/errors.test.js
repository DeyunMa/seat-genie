const { buildErrorPayload } = require("../src/utils/errors");

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
    const input = { message: "Validation Error", details: ["Field is required"] };
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
