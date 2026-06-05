import { describe, expect, it } from "vitest";
import {
  cmykToHexColor,
  hexToCmykChannels,
  normalizeHexColor,
  textColorToCmykChannels,
  textColorToPreviewHex,
  validateTextColor
} from "@/lib/color";
import type { CmykColor } from "@/types/placecard";

describe("print color helpers", () => {
  it("normalizes hex colors for backwards-compatible settings", () => {
    expect(normalizeHexColor("#abc")).toBe("#aabbcc");
    expect(normalizeHexColor("202124")).toBe("#202124");
    expect(normalizeHexColor("not-a-color")).toBeUndefined();
  });

  it("converts legacy hex colors to CMYK channels", () => {
    expect(hexToCmykChannels("#000000")).toEqual({ c: 0, m: 0, y: 0, k: 100 });
    expect(hexToCmykChannels("#ffffff")).toEqual({ c: 0, m: 0, y: 0, k: 0 });
    expect(hexToCmykChannels("#ff0000")).toEqual({ c: 0, m: 100, y: 100, k: 0 });
  });

  it("keeps CMYK state serializable and previewable", () => {
    const color: CmykColor = { mode: "cmyk", c: 10, m: 20, y: 30, k: 40 };

    expect(JSON.parse(JSON.stringify(color))).toEqual(color);
    expect(textColorToCmykChannels(color)).toEqual({ c: 10, m: 20, y: 30, k: 40 });
    expect(textColorToPreviewHex(color)).toBe(cmykToHexColor(color));
  });

  it("validates CMYK channels and hex color strings", () => {
    expect(validateTextColor({ mode: "cmyk", c: 0, m: 50, y: 100, k: 10 }, "Name color")).toEqual([]);
    expect(validateTextColor({ mode: "cmyk", c: -1, m: 101, y: 20, k: 30 }, "Name color")).toEqual([
      "Name color CMYK C must be between 0 and 100.",
      "Name color CMYK M must be between 0 and 100."
    ]);
    expect(validateTextColor("nope", "Table color")).toEqual([
      "Table color hex color must be a valid 3- or 6-digit hex value."
    ]);
  });
});
