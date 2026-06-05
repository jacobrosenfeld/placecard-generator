import { describe, expect, it } from "vitest";
import { extractGoogleFontUrl, googleFontsHref, googleFontsPdfHref, parseGoogleFontOverride } from "@/lib/typography";

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
    expect(googleFontsPdfHref("Cormorant Garamond@600")).toBe(
      "https://fonts.googleapis.com/css?family=Cormorant+Garamond:600"
    );
  });

  it("extracts the font file URL from Google CSS", () => {
    expect(
      extractGoogleFontUrl(`
        @font-face {
          font-family: 'Cormorant Garamond';
          src: url(https://fonts.gstatic.com/s/cormorantgaramond/example.woff2) format('woff2');
        }
      `)
    ).toBe("https://fonts.gstatic.com/s/cormorantgaramond/example.woff2");
  });
});
