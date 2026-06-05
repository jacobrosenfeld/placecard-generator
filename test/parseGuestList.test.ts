import { describe, expect, it } from "vitest";
import { mapGuestRows, parseMatrix } from "@/lib/parseGuestList";

describe("guest list parsing", () => {
  it("detects headers and maps default columns", () => {
    const parsed = parseMatrix([
      ["Name", "Table"],
      ["Dr. & Mrs. Jonathan Rosenberg", "12"],
      ["Sarah Levy", ""]
    ]);

    expect(parsed.hasHeader).toBe(true);
    expect(parsed.nameColumnIndex).toBe(0);
    expect(parsed.tableColumnIndex).toBe(1);

    const guests = mapGuestRows(parsed, 0, 1);
    expect(guests).toHaveLength(2);
    expect(guests[0].tableLabel).toBe("Table 12");
    expect(guests[1].warnings).toContain("Blank table value.");
  });

  it("flags duplicate guest names", () => {
    const parsed = parseMatrix([
      ["Name", "Table"],
      ["Sarah Levy", "1"],
      [" Sarah   Levy ", "2"]
    ]);
    const guests = mapGuestRows(parsed, 0, 1);

    expect(guests.every((guest) => guest.warnings.includes("Duplicate guest name."))).toBe(true);
  });
});
