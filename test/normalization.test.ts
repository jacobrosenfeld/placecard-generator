import { describe, expect, it } from "vitest";
import { formatTableLabel, normalizeWhitespace } from "@/lib/normalizeTableLabel";

describe("table normalization", () => {
  it("normalizes whitespace while preserving text", () => {
    expect(normalizeWhitespace("  Dr.   & Mrs.   Cohen  ")).toBe("Dr. & Mrs. Cohen");
  });

  it.each([
    ["12", "Table 12"],
    ["Table 12", "Table 12"],
    ["table 12", "Table 12"],
    ["TABLE 12", "Table 12"],
    ["Head Table", "Head Table"],
    ["No table assigned", "No table assigned"],
    ["", ""]
  ])("formats %s", (input, expected) => {
    expect(formatTableLabel(input)).toBe(expected);
  });
});
