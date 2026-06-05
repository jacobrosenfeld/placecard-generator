import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import fontkit from "@pdf-lib/fontkit";
import { createOutlineTextRenderer, fontPathToPdfLibSvgPath } from "@/lib/pdfTextRenderer";

describe("PDF outline text renderer", () => {
  it("measures bundled Pinyon Script outlines using fontkit advances", () => {
    const fontBytes = readFileSync("public/fonts/pinyon-script.ttf");
    const renderer = createOutlineTextRenderer(new Uint8Array(fontBytes));

    expect(renderer.measureText("Sarah Levy", 30)).toBeGreaterThan(80);
    expect(renderer.measureText("Sarah Levy", 60)).toBeCloseTo(
      renderer.measureText("Sarah Levy", 30) * 2,
      1
    );
  });

  it("converts fontkit Y-up paths for pdf-lib SVG drawing", () => {
    const fontBytes = readFileSync("public/fonts/pinyon-script.ttf");
    const font = fontkit.create(fontBytes);
    const path = font.layout("P").glyphs[0].path;
    const svgPath = fontPathToPdfLibSvgPath(path);

    expect(svgPath.startsWith("M212 2")).toBe(true);
    expect(svgPath).toContain("Q103 2 51.5 -38");
  });
});
