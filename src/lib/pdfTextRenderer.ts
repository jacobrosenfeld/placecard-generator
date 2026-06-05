import { StandardFonts } from "pdf-lib";
import type { Color, PDFDocument, PDFFont, PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { TextStyle } from "@/types/placecard";
import { fetchCuratedFontBytes, fetchGoogleFontBytes, getCuratedFont } from "./typography";

type GlyphPosition = {
  xAdvance: number;
  yAdvance?: number;
  xOffset?: number;
  yOffset?: number;
};

type Glyph = {
  path?: {
    commands?: {
      command: string;
      args: number[];
    }[];
    toSVG: () => string;
  };
};

type FontkitFont = {
  unitsPerEm: number;
  layout: (text: string) => {
    glyphs: Glyph[];
    positions: GlyphPosition[];
  };
};

export type PdfTextRenderer = {
  drawLine: (params: {
    page: PDFPage;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: Color;
  }) => void;
  measureText: (text: string, fontSize: number) => number;
};

export function createStandardTextRenderer(font: PDFFont): PdfTextRenderer {
  return {
    measureText: (text, fontSize) => font.widthOfTextAtSize(text, fontSize),
    drawLine: ({ page, text, x, y, fontSize, color }) => {
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color
      });
    }
  };
}

export function fontPathToPdfLibSvgPath(path: NonNullable<Glyph["path"]>): string {
  if (!path.commands) return path.toSVG();

  return path.commands
    .map(({ command, args }) => {
      if (command === "moveTo") return `M${args[0]} ${-args[1]}`;
      if (command === "lineTo") return `L${args[0]} ${-args[1]}`;
      if (command === "quadraticCurveTo") return `Q${args[0]} ${-args[1]} ${args[2]} ${-args[3]}`;
      if (command === "bezierCurveTo") {
        return `C${args[0]} ${-args[1]} ${args[2]} ${-args[3]} ${args[4]} ${-args[5]}`;
      }
      if (command === "closePath") return "Z";

      return "";
    })
    .filter(Boolean)
    .join("");
}

export function createOutlineTextRenderer(fontBytes: Uint8Array): PdfTextRenderer {
  const font = fontkit.create(fontBytes) as FontkitFont;

  function measureText(text: string, fontSize: number): number {
    const scale = fontSize / font.unitsPerEm;
    const run = font.layout(text);

    return run.positions.reduce((width, position) => width + position.xAdvance * scale, 0);
  }

  return {
    measureText,
    drawLine: ({ page, text, x, y, fontSize, color }) => {
      const scale = fontSize / font.unitsPerEm;
      const run = font.layout(text);
      let cursorX = 0;

      run.glyphs.forEach((glyph, index) => {
        const position = run.positions[index];
        const path = glyph.path ? fontPathToPdfLibSvgPath(glyph.path) : undefined;

        if (path) {
          page.drawSvgPath(path, {
            x: x + (cursorX + (position.xOffset || 0)) * scale,
            y: y + (position.yOffset || 0) * scale,
            scale,
            color
          });
        }

        cursorX += position.xAdvance;
      });
    }
  };
}

export async function createTextRenderer(pdfDoc: PDFDocument, style: TextStyle): Promise<PdfTextRenderer> {
  if (style.fontMode === "google") {
    try {
      const fontBytes = await fetchGoogleFontBytes(style.googleFontFamily);
      if (fontBytes) return createOutlineTextRenderer(fontBytes);
    } catch {
      // Fall back to a PDF-safe live text font if the remote font cannot be fetched or parsed.
    }
  }

  const curatedFont = getCuratedFont(style.fontFamily);
  const curatedFontBytes = await fetchCuratedFontBytes(curatedFont);
  if (curatedFontBytes) {
    return createOutlineTextRenderer(curatedFontBytes);
  }

  const standardFont = style.fontWeight === "bold" ? curatedFont.pdfBold : curatedFont.pdfRegular;
  const font = await pdfDoc.embedFont(standardFont || StandardFonts.TimesRoman);

  return createStandardTextRenderer(font);
}
