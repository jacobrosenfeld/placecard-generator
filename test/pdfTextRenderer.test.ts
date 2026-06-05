import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createOutlineTextRenderer } from "@/lib/pdfTextRenderer";

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
});
