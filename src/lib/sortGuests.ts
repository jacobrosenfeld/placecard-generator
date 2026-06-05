import type { ExportSortMode, GuestRow } from "@/types/placecard";

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base"
});

function compareText(left: string, right: string): number {
  return collator.compare(left, right);
}

export function sortGuestRows(guests: GuestRow[], sortMode: ExportSortMode): GuestRow[] {
  return guests
    .map((guest, index) => ({ guest, index }))
    .sort((left, right) => {
      const primary =
        sortMode === "table"
          ? compareText(left.guest.tableSortKey, right.guest.tableSortKey)
          : compareText(left.guest.nameSortKey, right.guest.nameSortKey);
      if (primary !== 0) return primary;

      const secondary =
        sortMode === "table"
          ? compareText(left.guest.nameSortKey, right.guest.nameSortKey)
          : compareText(left.guest.tableSortKey, right.guest.tableSortKey);
      if (secondary !== 0) return secondary;

      return left.index - right.index;
    })
    .map(({ guest }) => guest);
}
