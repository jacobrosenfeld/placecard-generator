import type { CardLayout, FoldType, Rect, Unit } from "@/types/placecard";
import { toPoints } from "./units";

export type BuildLayoutInput = {
  finishedWidth: number;
  finishedHeight: number;
  unit: Unit;
  bleed: number;
  safeMargin: number;
  foldType: FoldType;
};

export function insetRect(rect: Rect, inset: number): Rect {
  const safeInset = Math.max(0, inset);
  return {
    x: rect.x + safeInset,
    y: rect.y + safeInset,
    width: Math.max(0, rect.width - safeInset * 2),
    height: Math.max(0, rect.height - safeInset * 2)
  };
}

export function buildCardLayout(input: BuildLayoutInput): CardLayout {
  if (input.foldType !== "horizontal-tent") {
    throw new Error("Only horizontal tent fold is supported in the MVP.");
  }

  const finishedWidthPt = toPoints(input.finishedWidth, input.unit);
  const finishedHeightPt = toPoints(input.finishedHeight, input.unit);
  const bleedPt = toPoints(input.bleed, input.unit);
  const safeMarginPt = toPoints(input.safeMargin, input.unit);

  const flatWidthPt = finishedWidthPt;
  const flatHeightPt = finishedHeightPt * 2;
  const foldLineY = finishedHeightPt;

  return {
    finishedWidthPt,
    finishedHeightPt,
    flatWidthPt,
    flatHeightPt,
    bleedPt,
    safeMarginPt,
    foldLineY,
    bottomPanel: {
      x: 0,
      y: 0,
      width: flatWidthPt,
      height: finishedHeightPt
    },
    topPanel: {
      x: 0,
      y: finishedHeightPt,
      width: flatWidthPt,
      height: finishedHeightPt
    }
  };
}
