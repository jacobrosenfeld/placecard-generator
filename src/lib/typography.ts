import { StandardFonts, rgb } from "pdf-lib";
import type { RGB } from "pdf-lib";
import type { TextStyle } from "@/types/placecard";

export type CuratedFont = {
  id: string;
  label: string;
  cssFamily: string;
  pdfRegular?: StandardFonts;
  pdfBold?: StandardFonts;
  fontFileUrl?: string;
};

export const CURATED_FONTS: CuratedFont[] = [
  {
    id: "classic-serif",
    label: "Classic Serif",
    cssFamily: "Georgia, 'Times New Roman', serif",
    pdfRegular: StandardFonts.TimesRoman,
    pdfBold: StandardFonts.TimesRomanBold
  },
  {
    id: "modern-sans",
    label: "Modern Sans",
    cssFamily: "Helvetica, Arial, sans-serif",
    pdfRegular: StandardFonts.Helvetica,
    pdfBold: StandardFonts.HelveticaBold
  },
  {
    id: "formal-serif",
    label: "Formal Serif",
    cssFamily: "'Times New Roman', Times, serif",
    pdfRegular: StandardFonts.TimesRoman,
    pdfBold: StandardFonts.TimesRomanBold
  },
  {
    id: "production-mono",
    label: "Production Mono",
    cssFamily: "'Courier New', Courier, monospace",
    pdfRegular: StandardFonts.Courier,
    pdfBold: StandardFonts.CourierBold
  },
  {
    id: "script-pinyon",
    label: "Pinyon Script",
    cssFamily: "'Pinyon Script', cursive",
    fontFileUrl: "/fonts/pinyon-script.ttf"
  }
];

export const GOOGLE_FONTS_PDF_HEADERS = {
  Accept: "text/css",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
};

export function getCuratedFont(fontFamily: string): CuratedFont {
  return CURATED_FONTS.find((font) => font.id === fontFamily) || CURATED_FONTS[0];
}

export function parseGoogleFontOverride(value: string): { family: string; weight?: string } {
  const cleaned = value.trim();
  const [family, weight] = cleaned.split("@").map((part) => part.trim());
  return {
    family: family || "Cormorant Garamond",
    weight: weight || undefined
  };
}

export function googleFontCssFamily(value: string): string {
  const { family } = parseGoogleFontOverride(value);
  return `"${family}", ${getCuratedFont("classic-serif").cssFamily}`;
}

export function styleCssFontFamily(style: TextStyle): string {
  if (style.fontMode === "google") return googleFontCssFamily(style.googleFontFamily);
  return getCuratedFont(style.fontFamily).cssFamily;
}

export function googleFontsHref(value: string): string {
  const { family, weight } = parseGoogleFontOverride(value);
  const encodedFamily = family.replace(/\s+/g, "+");
  const weightParam = weight ? `:wght@${encodeURIComponent(weight)}` : "";
  return `https://fonts.googleapis.com/css2?family=${encodedFamily}${weightParam}&display=swap`;
}

export function googleFontsPdfHref(value: string): string {
  const { family, weight } = parseGoogleFontOverride(value);
  const encodedFamily = family.replace(/\s+/g, "+");
  const weightParam = weight ? `:${encodeURIComponent(weight)}` : "";
  return `https://fonts.googleapis.com/css?family=${encodedFamily}${weightParam}`;
}

export function extractGoogleFontUrl(css: string): string | undefined {
  const preferredFormatMatch = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)\s*format\('(truetype|opentype)'\)/);
  if (preferredFormatMatch?.[1]) return preferredFormatMatch[1];

  return css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1];
}

export async function fetchGoogleFontBytes(value: string): Promise<Uint8Array | undefined> {
  if (typeof window !== "undefined") {
    const response = await fetch(`/api/google-font?font=${encodeURIComponent(value)}`);
    if (!response.ok) return undefined;

    return new Uint8Array(await response.arrayBuffer());
  }

  const cssResponse = await fetch(googleFontsPdfHref(value), {
    headers: GOOGLE_FONTS_PDF_HEADERS
  });
  if (!cssResponse.ok) return undefined;

  const css = await cssResponse.text();
  const fontUrl = extractGoogleFontUrl(css);
  if (!fontUrl) return undefined;

  const fontResponse = await fetch(fontUrl);
  if (!fontResponse.ok) return undefined;

  return new Uint8Array(await fontResponse.arrayBuffer());
}

export async function fetchCuratedFontBytes(font: CuratedFont): Promise<Uint8Array | undefined> {
  if (!font.fontFileUrl) return undefined;
  if (typeof window === "undefined" && font.fontFileUrl.startsWith("/")) return undefined;

  const response = await fetch(font.fontFileUrl);
  if (!response.ok) return undefined;

  return new Uint8Array(await response.arrayBuffer());
}

export function hexToPdfRgb(value: string): RGB {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value.trim());
  if (!match) return rgb(0.12, 0.13, 0.14);

  return rgb(
    Number.parseInt(match[1], 16) / 255,
    Number.parseInt(match[2], 16) / 255,
    Number.parseInt(match[3], 16) / 255
  );
}
