import { describe, expect, it } from "vitest";
import { googleFontsHref, parseGoogleFontOverride } from "@/lib/typography";

describe("typography helpers", () => {
  it("parses Google font overrides with optional weight notation", () => {
    expect(parseGoogleFontOverride("Cormorant Garamond@600")).toEqual({
      family: "Cormorant Garamond",
      weight: "600"
    });
    expect(parseGoogleFontOverride("Libre Baskerville")).toEqual({
      family: "Libre Baskerville",
      weight: undefined
    });
  });

  it("builds a Google Fonts CSS URL", () => {
    expect(googleFontsHref("Cormorant Garamond@600")).toBe(
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&display=swap"
    );
  });
});
