import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { generatePlacecardPdf, panelRotationMatrix, proofMetadataLines } from "@/lib/pdfGenerator";
import { buildCardLayout } from "@/lib/layoutEngine";
import type { GuestRow, ProjectSettings } from "@/types/placecard";

const settings: ProjectSettings = {
  projectName: "Test Project",
  clientName: "",
  finishedWidth: 3.5,
  finishedHeight: 2,
  unit: "in",
  foldType: "horizontal-tent",
  bleed: 0.125,
  safeMargin: 0.125,
  outputMode: "single-up",
  includeLogo: false,
  nameText: {
    fontFamily: "eb-garamond",
    fontSize: 30,
    minFontSize: 12,
    fontWeight: "bold",
    uppercase: false,
    maxLines: 2,
    color: { mode: "cmyk", c: 10, m: 20, y: 30, k: 40 }
  },
  tableText: {
    fontFamily: "open-sans",
    fontSize: 18,
    minFontSize: 10,
    fontWeight: "normal",
    uppercase: false,
    maxLines: 1,
    color: "#202124"
  }
};

const guest: GuestRow = {
  id: "1",
  name: "Dr. & Mrs. Jonathan Rosenberg",
  tableRaw: "12",
  tableLabel: "Table 12",
  sourceRowNumber: 2,
  warnings: []
};

function inflatePdfStreams(bytes: Uint8Array): string {
  const source = Buffer.from(bytes).toString("latin1");
  const streams = source.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g);
  const decoded: string[] = [];

  for (const stream of streams) {
    const data = Buffer.from(stream[1], "latin1");

    try {
      decoded.push(inflateSync(data).toString("latin1"));
    } catch {
      decoded.push(data.toString("latin1"));
    }
  }

  return decoded.join("\n");
}

function decodePdfHexText(content: string): string {
  return content.replace(/<([0-9A-Fa-f]+)> Tj/g, (_match, hex: string) => Buffer.from(hex, "hex").toString("latin1"));
}

describe("PDF panel transforms", () => {
  it("rotates a panel 180 degrees around its own center", () => {
    expect(panelRotationMatrix({ x: 0, y: 144, width: 252, height: 144 }, 180)).toEqual([
      -1,
      0,
      0,
      -1,
      252,
      432
    ]);
  });

  it("keeps unrotated panels in page coordinates", () => {
    expect(panelRotationMatrix({ x: 0, y: 0, width: 252, height: 144 }, 0)).toEqual([
      1,
      0,
      0,
      1,
      0,
      0
    ]);
  });

  it("generates two imposed full-flat pages for each card", async () => {
    const bytes = await generatePlacecardPdf({
      settings,
      guests: [guest],
      outputMode: "single-up"
    });
    const pdf = await PDFDocument.load(bytes);
    const pages = pdf.getPages();

    expect(pdf.getPageCount()).toBe(2);
    expect(pages[0].getWidth()).toBe(252);
    expect(pages[0].getHeight()).toBe(288);
    expect(pages[1].getWidth()).toBe(252);
    expect(pages[1].getHeight()).toBe(288);
  });

  it("appends a proof metadata page with typography and color settings", async () => {
    const proofSettings = {
      ...settings,
      clientName: "JJA",
      outputMode: "proof" as const
    };
    const layout = buildCardLayout(proofSettings);
    const metadataLines = proofMetadataLines(proofSettings, layout);
    const bytes = await generatePlacecardPdf({
      settings: proofSettings,
      guests: [guest],
      outputMode: "proof"
    });
    const pdf = await PDFDocument.load(bytes);
    const readableStreams = decodePdfHexText(inflatePdfStreams(bytes));

    expect(pdf.getPageCount()).toBe(3);
    expect(metadataLines).toContain("Proof PDF metadata");
    expect(metadataLines).toContain("Name text: EB Garamond Bold | 30pt | min 12pt | 2 max lines | uppercase no | color C10 M20 Y30 K40");
    expect(metadataLines).toContain("Table text: Open Sans Regular | 18pt | min 10pt | 1 max line | uppercase no | color C11.11 M8.33 Y0 K85.88 from #202124");
    expect(readableStreams).toContain("Proof PDF metadata");
    expect(readableStreams).toContain("Name text: EB Garamond Bold");
    expect(readableStreams).toContain("color C10 M20 Y30 K40");
  });

  it("emits CMYK color operators in generated PDF content", async () => {
    const bytes = await generatePlacecardPdf({
      settings,
      guests: [guest],
      outputMode: "single-up"
    });
    const decodedStreams = inflatePdfStreams(bytes);

    expect(decodedStreams).toContain("0.1 0.2 0.3 0.4 k");
    expect(decodedStreams).not.toMatch(/\srg\b/);
    expect(decodedStreams).not.toMatch(/\sRG\b/);
  });
});
