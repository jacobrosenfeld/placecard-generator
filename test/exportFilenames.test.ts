import { describe, expect, it } from "vitest";
import { buildPdfFilename, formatLocalExportTimestamp, sanitizeFilenamePart } from "@/lib/exportFilenames";

describe("PDF export filenames", () => {
  it("formats timestamps with local date and lowercase meridiem", () => {
    const date = new Date(2026, 5, 5, 15, 45);

    expect(formatLocalExportTimestamp(date)).toBe("06.05.26 0345 pm");
  });

  it("uses 12 for midnight and keeps minutes padded", () => {
    const date = new Date(2026, 0, 2, 0, 7);

    expect(formatLocalExportTimestamp(date)).toBe("01.02.26 1207 am");
  });

  it("sanitizes unsafe project filename characters", () => {
    expect(sanitizeFilenamePart("Jacob / Sarah: proofs?", "placecards")).toBe("Jacob_Sarah_proofs");
    expect(sanitizeFilenamePart(" / : * ", "placecards")).toBe("placecards");
  });

  it("builds proof and print-ready PDF filenames", () => {
    const date = new Date(2026, 5, 5, 15, 45);

    expect(buildPdfFilename("Wedding Placecards", "proof", date)).toBe("Wedding_Placecards_proof_06.05.26 0345 pm.pdf");
    expect(buildPdfFilename("Wedding Placecards", "single-up", date)).toBe("Wedding_Placecards_print-ready_06.05.26 0345 pm.pdf");
  });
});
