import { readFileSync } from "node:fs";
import fontkit from "@pdf-lib/fontkit";
import { describe, expect, it } from "vitest";
import { availableFontWeights, CURATED_FONTS, normalizeFontWeight, styleCssFontWeight } from "@/lib/typography";
import type { TextStyle } from "@/types/placecard";

describe("typography helpers", () => {
  it("exposes only the bundled curated font set", () => {
    expect(CURATED_FONTS.map((font) => font.id)).toEqual([
      "eb-garamond",
      "crimson-text",
      "open-sans",
      "pinyon-script",
      "imperial-script",
      "forum",
      "niconne"
    ]);
  });

  it("offers light only for families that support it", () => {
    expect(availableFontWeights("open-sans")).toEqual(["light", "normal", "bold"]);
    expect(availableFontWeights("eb-garamond")).toEqual(["normal", "bold"]);
    expect(normalizeFontWeight("crimson-text", "light")).toBe("normal");
  });

  it("maps selected font weights to standard CSS numeric values", () => {
    const style = {
      fontFamily: "open-sans",
      fontWeight: "light"
    } as TextStyle;

    expect(styleCssFontWeight(style)).toBe(300);
    expect(styleCssFontWeight({ ...style, fontWeight: "normal" })).toBe(400);
    expect(styleCssFontWeight({ ...style, fontWeight: "bold" })).toBe(700);
  });

  it("loads bundled font files with basic Latin glyph coverage", () => {
    const fontFileUrls = new Set(
      CURATED_FONTS.flatMap((font) => Object.values(font.fontFileUrls))
        .filter((url): url is string => Boolean(url))
    );

    for (const fontFileUrl of fontFileUrls) {
      const font = fontkit.create(readFileSync(`public${fontFileUrl}`));
      const run = font.layout("Sarah Levy Table 12");

      expect(run.glyphs.every((glyph) => glyph.id !== 0)).toBe(true);
      expect(run.positions.reduce((width, position) => width + position.xAdvance, 0)).toBeGreaterThan(0);
    }
  });
});
