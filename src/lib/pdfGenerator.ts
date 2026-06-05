import {
  PDFDocument,
  StandardFonts,
  cmyk,
  concatTransformationMatrix,
  popGraphicsState,
  pushGraphicsState
} from "pdf-lib";
import type { CardLayout, GuestRow, LogoSettings, OutputMode, ProjectSettings, Rect, TextStyle } from "@/types/placecard";
import { buildCardLayout, insetRect } from "./layoutEngine";
import { fitTextToBox } from "./textFit";
import { createTextRenderer } from "./pdfTextRenderer";
import type { PdfTextRenderer } from "./pdfTextRenderer";
import { isCmykColor, textColorToCmykChannels, textColorToPdfCmyk, textColorToPreviewHex } from "./color";
import { displayTextForStyle, styledTextRuns } from "./textStyleRuns";
import { FONT_WEIGHT_LABELS, getCuratedFont, normalizeFontWeight } from "./typography";
import { formatInchesFromPoints } from "./units";
import { sortGuestRows } from "./sortGuests";

type GeneratePdfInput = {
  settings: ProjectSettings;
  guests: GuestRow[];
  outputMode: OutputMode;
};

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const [, base64 = ""] = dataUrl.split(",");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function embedLogo(pdfDoc: PDFDocument, logo?: LogoSettings) {
  if (!logo || logo.mimeType === "image/svg+xml") return undefined;
  const bytes = dataUrlToBytes(logo.dataUrl);
  if (logo.mimeType === "image/png") return pdfDoc.embedPng(bytes);
  if (logo.mimeType === "image/jpeg" || logo.mimeType === "image/jpg") return pdfDoc.embedJpg(bytes);
  return undefined;
}

function textX(panel: Rect, lineWidth: number): number {
  return panel.x + (panel.width - lineWidth) / 2;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/g, "").replace(/\.$/g, "");
}

function formatCmykText(color: TextStyle["color"]): string {
  const channels = textColorToCmykChannels(color);
  const cmykText = `C${formatNumber(channels.c)} M${formatNumber(channels.m)} Y${formatNumber(channels.y)} K${formatNumber(channels.k)}`;

  if (isCmykColor(color)) return cmykText;

  return `${cmykText} from ${textColorToPreviewHex(color)}`;
}

function formatTextStyleMetadata(label: string, style: TextStyle): string {
  const curatedFont = getCuratedFont(style.fontFamily);
  const fontWeight = normalizeFontWeight(curatedFont.id, style.fontWeight);
  const weightLabel = FONT_WEIGHT_LABELS[fontWeight];

  return [
    `${label}: ${curatedFont.label} ${weightLabel}`,
    `${formatNumber(style.fontSize)}pt`,
    `min ${formatNumber(style.minFontSize)}pt`,
    `${style.maxLines} max line${style.maxLines === 1 ? "" : "s"}`,
    `uppercase ${style.uppercase ? "yes" : "no"}`,
    `small caps ${style.smallCaps ? "yes" : "no"}`,
    `color ${formatCmykText(style.color)}`
  ].join(" | ");
}

function printableProofText(value: string): string {
  return value.replace(/[^\x20-\x7e]/g, "?");
}

function wrapProofLine(line: string, maxLength: number): string[] {
  const words = printableProofText(line).split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    if (!word) return;

    if (word.length > maxLength) {
      if (currentLine) lines.push(currentLine);
      for (let index = 0; index < word.length; index += maxLength) {
        lines.push(word.slice(index, index + maxLength));
      }
      currentLine = "";
      return;
    }

    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length > maxLength) {
      lines.push(currentLine);
      currentLine = word;
      return;
    }

    currentLine = nextLine;
  });

  if (currentLine) lines.push(currentLine);

  return lines.length ? lines : [""];
}

export function proofMetadataLines(settings: ProjectSettings, layout: CardLayout): string[] {
  const lines = [
    "Proof PDF metadata",
    `Project: ${settings.projectName || "Untitled"}${settings.clientName ? ` | Client: ${settings.clientName}` : ""}`,
    `Export sort: ${settings.exportSortMode === "table" ? "Table number" : "Guest last name"}`,
    `Flat page: ${formatInchesFromPoints(layout.flatWidthPt)} x ${formatInchesFromPoints(layout.flatHeightPt)} | Finished folded: ${formatInchesFromPoints(layout.finishedWidthPt)} x ${formatInchesFromPoints(layout.finishedHeightPt)}`,
    `Safe margin: ${formatInchesFromPoints(layout.safeMarginPt)} | Bleed: ${formatInchesFromPoints(layout.bleedPt)}`,
    formatTextStyleMetadata("Name text", settings.nameText),
    formatTextStyleMetadata("Table text", settings.tableText)
  ];

  if (settings.includeLogo && settings.logo) {
    lines.push(
      `Logo: ${settings.logo.fileName} | Placement: ${settings.logo.placement} | Max width ${formatNumber(settings.logo.maxWidthPercent)}% | Max height ${formatNumber(settings.logo.maxHeightPercent)}%`
    );
  }

  return lines;
}

export function panelRotationMatrix(panel: Rect, rotation: 0 | 180): [number, number, number, number, number, number] {
  if (rotation === 0) return [1, 0, 0, 1, 0, 0];

  const centerX = panel.x + panel.width / 2;
  const centerY = panel.y + panel.height / 2;

  return [-1, 0, 0, -1, centerX * 2, centerY * 2];
}

function drawCenteredContent(params: {
  page: ReturnType<PDFDocument["addPage"]>;
  panel: Rect;
  layout: CardLayout;
  text: string;
  style: TextStyle;
  textRenderer: PdfTextRenderer;
  rotation: 0 | 180;
  logoImage?: Awaited<ReturnType<typeof embedLogo>>;
  logo?: LogoSettings;
  drawLogo: boolean;
}) {
  const { page, panel, layout, style, textRenderer, rotation, logoImage, logo, drawLogo } = params;
  const safePanel = insetRect(panel, layout.safeMarginPt);
  const finalText = displayTextForStyle(params.text, style);
  const logoMaxHeight = drawLogo && logo ? safePanel.height * (logo.maxHeightPercent / 100) : 0;
  const logoGap = logoMaxHeight ? 10 : 0;
  const textBoxHeight = safePanel.height - logoMaxHeight - logoGap;
  const measureStyledText = (text: string, fontSize: number) =>
    styledTextRuns(text, style).reduce((width, run) => width + textRenderer.measureText(run.text, fontSize * run.fontScale), 0);
  const fitted = fitTextToBox({
    text: finalText,
    maxWidth: safePanel.width,
    maxHeight: textBoxHeight,
    initialFontSize: style.fontSize,
    minFontSize: style.minFontSize,
    maxLines: style.maxLines,
    measureText: measureStyledText
  });
  const blockHeight = fitted.lines.length * fitted.lineHeight + logoMaxHeight + logoGap;
  const startY = safePanel.y + (safePanel.height + blockHeight) / 2 - logoMaxHeight;
  const matrix = panelRotationMatrix(panel, rotation);

  page.pushOperators(
    pushGraphicsState(),
    concatTransformationMatrix(...matrix)
  );

  if (drawLogo && logo && logoImage) {
    const maxWidth = safePanel.width * (logo.maxWidthPercent / 100);
    const maxHeight = safePanel.height * (logo.maxHeightPercent / 100);
    const scale = Math.min(maxWidth / logoImage.width, maxHeight / logoImage.height, 1);
    const width = logoImage.width * scale;
    const height = logoImage.height * scale;
    const logoX = safePanel.x + (safePanel.width - width) / 2;
    const logoY = startY;

    page.drawImage(logoImage, {
      x: logoX,
      y: logoY,
      width,
      height
    });
  }

  fitted.lines.forEach((line, index) => {
    const width = measureStyledText(line, fitted.fontSize);
    const y = startY - logoGap - logoMaxHeight - fitted.lineHeight * (index + 1);
    let runX = textX(safePanel, width);
    const color = textColorToPdfCmyk(style.color);

    styledTextRuns(line, style).forEach((run) => {
      const runFontSize = fitted.fontSize * run.fontScale;

      textRenderer.drawLine({
        page,
        text: run.text,
        x: runX,
        y,
        fontSize: runFontSize,
        color
      });
      runX += textRenderer.measureText(run.text, runFontSize);
    });
  });

  page.pushOperators(popGraphicsState());
}

function drawProofGuides(
  page: ReturnType<PDFDocument["addPage"]>,
  layout: CardLayout,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  sideLabel: string
) {
  page.drawLine({
    start: { x: 0, y: layout.foldLineY },
    end: { x: layout.flatWidthPt, y: layout.foldLineY },
    thickness: 0.5,
    color: cmyk(0, 0.36, 0.73, 0.45),
    dashArray: [4, 4]
  });

  page.drawText(
    `${sideLabel}: ${formatInchesFromPoints(layout.flatWidthPt)} x ${formatInchesFromPoints(layout.flatHeightPt)}`,
    {
      x: 8,
      y: layout.flatHeightPt - 12,
      size: 7,
      font,
      color: cmyk(0, 0, 0, 0.55)
    }
  );

  for (const panel of [layout.topPanel, layout.bottomPanel]) {
    const safe = insetRect(panel, layout.safeMarginPt);
    page.drawRectangle({
      x: safe.x,
      y: safe.y,
      width: safe.width,
      height: safe.height,
      borderColor: cmyk(0, 0, 0, 0.28),
      borderWidth: 0.35
    });
  }

  page.drawText(`Safe margin: ${formatInchesFromPoints(layout.safeMarginPt)}`, {
    x: 8,
    y: 8,
    size: 7,
    font,
    color: cmyk(0, 0, 0, 0.55)
  });
}

function drawProofMetadataPage(
  pdfDoc: PDFDocument,
  settings: ProjectSettings,
  layout: CardLayout,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>
) {
  const page = pdfDoc.addPage([layout.flatWidthPt, layout.flatHeightPt]);
  const pageMargin = 18;
  const maxLineLength = 108;
  const lineHeight = 10;
  let y = layout.flatHeightPt - pageMargin - 8;

  proofMetadataLines(settings, layout).forEach((line, index) => {
    const wrappedLines = wrapProofLine(line, maxLineLength);

    wrappedLines.forEach((wrappedLine) => {
      page.drawText(wrappedLine.trim(), {
        x: pageMargin,
        y,
        size: index === 0 ? 9 : 7,
        font,
        color: cmyk(0, 0, 0, index === 0 ? 0.85 : 0.65)
      });
      y -= lineHeight;
    });

    if (index === 0) y -= 2;
  });
}

export async function generatePlacecardPdf({ settings, guests, outputMode }: GeneratePdfInput): Promise<Uint8Array> {
  const layout = buildCardLayout(settings);
  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const nameTextRenderer = await createTextRenderer(pdfDoc, settings.nameText);
  const tableTextRenderer = await createTextRenderer(pdfDoc, settings.tableText);
  const logoImage = await embedLogo(pdfDoc, settings.includeLogo ? settings.logo : undefined);
  const sortedGuests = sortGuestRows(guests, settings.exportSortMode);

  sortedGuests.forEach((guest, index) => {
    const namePage = pdfDoc.addPage([layout.flatWidthPt, layout.flatHeightPt]);
    if (outputMode === "proof") drawProofGuides(namePage, layout, regularFont, `Side 1 name ${index + 1}`);

    drawCenteredContent({
      page: namePage,
      panel: layout.bottomPanel,
      layout,
      text: guest.name,
      style: settings.nameText,
      textRenderer: nameTextRenderer,
      rotation: 0,
      logoImage,
      logo: settings.logo,
      drawLogo: settings.includeLogo && (settings.logo?.placement === "above-name" || settings.logo?.placement === "both-panels")
    });

    const tablePage = pdfDoc.addPage([layout.flatWidthPt, layout.flatHeightPt]);
    if (outputMode === "proof") drawProofGuides(tablePage, layout, regularFont, `Side 2 table ${index + 1}`);

    drawCenteredContent({
      page: tablePage,
      panel: layout.topPanel,
      layout,
      text: guest.tableLabel,
      style: settings.tableText,
      textRenderer: tableTextRenderer,
      rotation: 180,
      logoImage,
      logo: settings.logo,
      drawLogo: settings.includeLogo && (settings.logo?.placement === "above-table" || settings.logo?.placement === "both-panels")
    });

    if (outputMode === "proof") {
      namePage.drawText(`Proof ${index + 1} of ${sortedGuests.length} side 1`, {
        x: 8,
        y: 18,
        size: 6,
        font: regularFont,
        color: cmyk(0, 0, 0, 0.55)
      });
      tablePage.drawText(`Proof ${index + 1} of ${sortedGuests.length} side 2`, {
        x: 8,
        y: 18,
        size: 6,
        font: regularFont,
        color: cmyk(0, 0, 0, 0.55)
      });
    }
  });

  if (outputMode === "proof") {
    drawProofMetadataPage(pdfDoc, settings, layout, regularFont);
  }

  return pdfDoc.save();
}
