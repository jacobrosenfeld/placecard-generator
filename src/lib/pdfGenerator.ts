import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import type { CardLayout, GuestRow, LogoSettings, OutputMode, ProjectSettings, Rect, TextStyle } from "@/types/placecard";
import { buildCardLayout, insetRect } from "./layoutEngine";
import { fitTextToBox } from "./textFit";

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

function textX(panel: Rect, lineWidth: number, align: TextStyle["align"]): number {
  if (align === "left") return panel.x;
  if (align === "right") return panel.x + panel.width - lineWidth;
  return panel.x + (panel.width - lineWidth) / 2;
}

function drawCenteredContent(params: {
  page: ReturnType<PDFDocument["addPage"]>;
  panel: Rect;
  layout: CardLayout;
  text: string;
  style: TextStyle;
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>;
  boldFont: Awaited<ReturnType<PDFDocument["embedFont"]>>;
  rotation: 0 | 180;
  logoImage?: Awaited<ReturnType<typeof embedLogo>>;
  logo?: LogoSettings;
  drawLogo: boolean;
}) {
  const { page, panel, layout, style, font, boldFont, rotation, logoImage, logo, drawLogo } = params;
  const safePanel = insetRect(panel, layout.safeMarginPt);
  const activeFont = style.fontWeight === "bold" ? boldFont : font;
  const finalText = style.uppercase ? params.text.toLocaleUpperCase() : params.text;
  const logoMaxHeight = drawLogo && logo ? safePanel.height * (logo.maxHeightPercent / 100) : 0;
  const logoGap = logoMaxHeight ? 10 : 0;
  const textBoxHeight = safePanel.height - logoMaxHeight - logoGap;
  const fitted = fitTextToBox({
    text: finalText,
    maxWidth: safePanel.width,
    maxHeight: textBoxHeight,
    initialFontSize: style.fontSize,
    minFontSize: style.minFontSize,
    maxLines: style.maxLines,
    measureText: (value, size) => activeFont.widthOfTextAtSize(value, size)
  });
  const blockHeight = fitted.lines.length * fitted.lineHeight + logoMaxHeight + logoGap;
  const startY = safePanel.y + (safePanel.height + blockHeight) / 2 - logoMaxHeight;
  const rotate = rotation === 180 ? degrees(180) : degrees(0);
  const centerX = panel.x + panel.width / 2;
  const centerY = panel.y + panel.height / 2;

  if (drawLogo && logo && logoImage) {
    const maxWidth = safePanel.width * (logo.maxWidthPercent / 100);
    const maxHeight = safePanel.height * (logo.maxHeightPercent / 100);
    const scale = Math.min(maxWidth / logoImage.width, maxHeight / logoImage.height, 1);
    const width = logoImage.width * scale;
    const height = logoImage.height * scale;
    const logoX = safePanel.x + (safePanel.width - width) / 2;
    const logoY = startY;

    page.drawImage(logoImage, {
      x: rotation === 180 ? centerX * 2 - logoX - width : logoX,
      y: rotation === 180 ? centerY * 2 - logoY - height : logoY,
      width,
      height,
      rotate
    });
  }

  fitted.lines.forEach((line, index) => {
    const width = activeFont.widthOfTextAtSize(line, fitted.fontSize);
    const y = startY - logoGap - logoMaxHeight - fitted.lineHeight * (index + 1);
    const x = textX(safePanel, width, style.align);
    page.drawText(line, {
      x: rotation === 180 ? centerX * 2 - x - width : x,
      y: rotation === 180 ? centerY * 2 - y - fitted.fontSize : y,
      size: fitted.fontSize,
      font: activeFont,
      color: rgb(0.12, 0.13, 0.14),
      rotate
    });
  });
}

function drawProofGuides(page: ReturnType<PDFDocument["addPage"]>, layout: CardLayout) {
  page.drawLine({
    start: { x: 0, y: layout.foldLineY },
    end: { x: layout.flatWidthPt, y: layout.foldLineY },
    thickness: 0.5,
    color: rgb(0.55, 0.35, 0.15),
    dashArray: [4, 4]
  });

  for (const panel of [layout.topPanel, layout.bottomPanel]) {
    const safe = insetRect(panel, layout.safeMarginPt);
    page.drawRectangle({
      x: safe.x,
      y: safe.y,
      width: safe.width,
      height: safe.height,
      borderColor: rgb(0.72, 0.72, 0.72),
      borderWidth: 0.35
    });
  }
}

export async function generatePlacecardPdf({ settings, guests, outputMode }: GeneratePdfInput): Promise<Uint8Array> {
  const layout = buildCardLayout(settings);
  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const logoImage = await embedLogo(pdfDoc, settings.includeLogo ? settings.logo : undefined);

  guests.forEach((guest, index) => {
    const page = pdfDoc.addPage([layout.flatWidthPt, layout.flatHeightPt]);
    if (outputMode === "proof") drawProofGuides(page, layout);

    drawCenteredContent({
      page,
      panel: layout.topPanel,
      layout,
      text: guest.name,
      style: settings.nameText,
      font: regularFont,
      boldFont,
      rotation: 180,
      logoImage,
      logo: settings.logo,
      drawLogo: settings.includeLogo && (settings.logo?.placement === "above-name" || settings.logo?.placement === "both-panels")
    });

    drawCenteredContent({
      page,
      panel: layout.bottomPanel,
      layout,
      text: guest.tableLabel,
      style: settings.tableText,
      font: regularFont,
      boldFont,
      rotation: 0,
      logoImage,
      logo: settings.logo,
      drawLogo: settings.includeLogo && settings.logo?.placement === "above-table"
    });

    if (outputMode === "proof") {
      page.drawText(`Proof ${index + 1} of ${guests.length}`, {
        x: 8,
        y: 8,
        size: 6,
        font: regularFont,
        color: rgb(0.45, 0.45, 0.45)
      });
    }
  });

  return pdfDoc.save();
}
