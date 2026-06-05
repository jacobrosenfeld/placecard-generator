import { describe, expect, it } from "vitest";
import { buildCardLayout } from "@/lib/layoutEngine";
import { formatInchesFromPoints, toPoints } from "@/lib/units";

describe("units and horizontal tent layout", () => {
  it("converts inches and millimeters to points", () => {
    expect(toPoints(1, "in")).toBe(72);
    expect(toPoints(25.4, "mm")).toBeCloseTo(72);
    expect(toPoints(36, "pt")).toBe(36);
  });

  it("formats point values as inches for operator-facing measurements", () => {
    expect(formatInchesFromPoints(252)).toBe("3.50 in");
    expect(formatInchesFromPoints(9)).toBe("0.13 in");
  });

  it("builds the flat unfolded horizontal tent geometry", () => {
    const layout = buildCardLayout({
      finishedWidth: 3.5,
      finishedHeight: 2,
      unit: "in",
      bleed: 0.125,
      safeMargin: 0.125,
      foldType: "horizontal-tent"
    });

    expect(layout.finishedWidthPt).toBe(252);
    expect(layout.finishedHeightPt).toBe(144);
    expect(layout.flatWidthPt).toBe(252);
    expect(layout.flatHeightPt).toBe(288);
    expect(layout.foldLineY).toBe(144);
    expect(layout.bottomPanel).toEqual({ x: 0, y: 0, width: 252, height: 144 });
    expect(layout.topPanel).toEqual({ x: 0, y: 144, width: 252, height: 144 });
  });
});
