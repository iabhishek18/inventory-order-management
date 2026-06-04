import { describe, expect, it } from "vitest";
import { extractApiError, formatCurrency } from "@/lib/errors";

describe("extractApiError", () => {
  it("returns the fallback when error is unknown", () => {
    expect(extractApiError(null, "fb")).toBe("fb");
  });

  it("returns Error.message when given an Error", () => {
    expect(extractApiError(new Error("boom"))).toBe("boom");
  });
});

describe("formatCurrency", () => {
  it("formats a numeric string as USD", () => {
    expect(formatCurrency("12.5")).toBe("$12.50");
  });

  it("returns $0.00 for non-numeric input", () => {
    expect(formatCurrency("abc")).toBe("$0.00");
  });
});
