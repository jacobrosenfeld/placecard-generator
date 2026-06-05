import { describe, expect, it } from "vitest";
import { sortGuestRows } from "@/lib/sortGuests";
import type { GuestRow } from "@/types/placecard";

function guest(name: string, tableRaw: string, lastName: string, index: number): GuestRow {
  const tableNumber = Number(tableRaw.replace(/\D/g, ""));

  return {
    id: `${index}`,
    name,
    tableRaw,
    tableLabel: tableRaw ? `Table ${tableRaw}` : "",
    lastName,
    nameSortKey: lastName.toLocaleLowerCase(),
    tableSortKey: tableRaw ? `0-${String(tableNumber).padStart(8, "0")}-${tableRaw}` : "2",
    sourceRowNumber: index,
    warnings: []
  };
}

describe("guest export sorting", () => {
  const guests = [
    guest("Zoe Cohen", "12", "Cohen", 1),
    guest("Aaron Smith", "2", "Smith", 2),
    guest("Bella Adams", "2", "Adams", 3)
  ];

  it("sorts by table number with guest name as a stable secondary key", () => {
    expect(sortGuestRows(guests, "table").map((row) => row.name)).toEqual([
      "Bella Adams",
      "Aaron Smith",
      "Zoe Cohen"
    ]);
  });

  it("sorts by parsed last name for alphabetical exports", () => {
    expect(sortGuestRows(guests, "last-name").map((row) => row.name)).toEqual([
      "Bella Adams",
      "Zoe Cohen",
      "Aaron Smith"
    ]);
  });
});
