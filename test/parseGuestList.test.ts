import { describe, expect, it } from "vitest";
import { extractLastName, mapGuestRows, parseMatrix } from "@/lib/parseGuestList";

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
    expect(guests[0].lastName).toBe("Rosenberg");
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

  it("extracts last names from common event guest formats", () => {
    expect(extractLastName("Mr. and Mrs. John Smith")).toBe("Smith");
    expect(extractLastName("Dr. Jane Doe")).toBe("Doe");
    expect(extractLastName("Smith, John")).toBe("Smith");
    expect(extractLastName("Ana de la Cruz")).toBe("de la Cruz");
    expect(extractLastName("Lucy Van Dyke")).toBe("Van Dyke");
    expect(extractLastName("Madonna")).toBe("Madonna");
  });

  it("stores normalized name and table sort keys separately from display values", () => {
    const parsed = parseMatrix([
      ["Full Name", "Table Number"],
      ["Smith, John", "Table 10"],
      ["Ana de la Cruz", "2"]
    ]);
    const guests = mapGuestRows(parsed, parsed.nameColumnIndex, parsed.tableColumnIndex);

    expect(guests[0]).toMatchObject({
      name: "Smith, John",
      lastName: "Smith",
      nameSortKey: "smith",
      tableLabel: "Table 10",
      tableSortKey: "0-00000010-table 10"
    });
    expect(guests[1]).toMatchObject({
      name: "Ana de la Cruz",
      lastName: "de la Cruz",
      nameSortKey: "de la cruz",
      tableLabel: "Table 2",
      tableSortKey: "0-00000002-2"
    });
  });
});
