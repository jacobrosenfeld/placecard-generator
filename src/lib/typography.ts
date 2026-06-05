import { rgb } from "pdf-lib";
import type { RGB } from "pdf-lib";
import type { FontWeight, TextStyle } from "@/types/placecard";

export type CuratedFont = {
  id: string;
  label: string;
  cssFamily: string;
  weights: FontWeight[];
  fontFileUrls: Partial<Record<FontWeight, string>>;
  syntheticBold?: boolean;
};

export const FONT_WEIGHT_LABELS: Record<FontWeight, string> = {
  light: "Light",
  normal: "Regular",
  bold: "Bold"
};

export const FONT_WEIGHT_VALUES: Record<FontWeight, number> = {
  light: 300,
  normal: 400,
  bold: 700
};

export const CURATED_FONTS: CuratedFont[] = [
  {
    id: "eb-garamond",
    label: "EB Garamond",
    cssFamily: "'EB Garamond', Garamond, Georgia, serif",
    weights: ["normal", "bold"],
    fontFileUrls: {
      normal: "/fonts/eb-garamond-regular.ttf",
      bold: "/fonts/eb-garamond-bold.ttf"
    }
  },
  {
    id: "crimson-text",
    label: "Crimson Text",
    cssFamily: "'Crimson Text', Georgia, serif",
    weights: ["normal", "bold"],
    fontFileUrls: {
      normal: "/fonts/crimson-text-regular.ttf",
      bold: "/fonts/crimson-text-bold.ttf"
    }
  },
  {
    id: "open-sans",
    label: "Open Sans",
    cssFamily: "'Open Sans', Arial, sans-serif",
    weights: ["light", "normal", "bold"],
    fontFileUrls: {
      light: "/fonts/open-sans-light.ttf",
      normal: "/fonts/open-sans-regular.ttf",
      bold: "/fonts/open-sans-bold.ttf"
    }
  },
  {
    id: "pinyon-script",
    label: "Pinyon Script",
    cssFamily: "'Pinyon Script', cursive",
    weights: ["normal", "bold"],
    fontFileUrls: {
      normal: "/fonts/pinyon-script.ttf",
      bold: "/fonts/pinyon-script.ttf"
    },
    syntheticBold: true
  },
  {
    id: "imperial-script",
    label: "Imperial Script",
    cssFamily: "'Imperial Script', cursive",
    weights: ["normal", "bold"],
    fontFileUrls: {
      normal: "/fonts/imperial-script.ttf",
      bold: "/fonts/imperial-script.ttf"
    },
    syntheticBold: true
  },
  {
    id: "forum",
    label: "Forum",
    cssFamily: "'Forum', Georgia, serif",
    weights: ["normal", "bold"],
    fontFileUrls: {
      normal: "/fonts/forum.ttf",
      bold: "/fonts/forum.ttf"
    },
    syntheticBold: true
  },
  {
    id: "niconne",
    label: "Niconne",
    cssFamily: "'Niconne', cursive",
    weights: ["normal", "bold"],
    fontFileUrls: {
      normal: "/fonts/niconne.ttf",
      bold: "/fonts/niconne.ttf"
    },
    syntheticBold: true
  }
];

export function getCuratedFont(fontFamily: string): CuratedFont {
  return CURATED_FONTS.find((font) => font.id === fontFamily) || CURATED_FONTS[0];
}

export function availableFontWeights(fontFamily: string): FontWeight[] {
  return getCuratedFont(fontFamily).weights;
}

export function normalizeFontWeight(fontFamily: string, fontWeight: FontWeight): FontWeight {
  const weights = availableFontWeights(fontFamily);
  return weights.includes(fontWeight) ? fontWeight : "normal";
}

export function styleCssFontFamily(style: TextStyle): string {
  return getCuratedFont(style.fontFamily).cssFamily;
}

export function styleCssFontWeight(style: TextStyle): number {
  return FONT_WEIGHT_VALUES[normalizeFontWeight(style.fontFamily, style.fontWeight)];
}

export async function fetchCuratedFontBytes(font: CuratedFont, fontWeight: FontWeight): Promise<Uint8Array | undefined> {
  const normalizedWeight = normalizeFontWeight(font.id, fontWeight);
  const fontFileUrl = font.fontFileUrls[normalizedWeight] || font.fontFileUrls.normal;
  if (!fontFileUrl) return undefined;

  let response: Response;
  try {
    response = await fetch(fontFileUrl);
  } catch {
    return undefined;
  }

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
