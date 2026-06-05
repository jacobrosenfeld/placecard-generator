import { describe, expect, it } from "vitest";
import { displayTextForStyle, SMALL_CAPS_FONT_SCALE, styledTextRuns } from "@/lib/textStyleRuns";
import type { TextStyle } from "@/types/placecard";

const baseStyle: Pick<TextStyle, "uppercase" | "smallCaps"> = {
  uppercase: false,
  smallCaps: false
};

describe("styled text runs", () => {
  it("keeps normal text as one full-size run", () => {
    expect(styledTextRuns("Sarah Levy", baseStyle)).toEqual([
      { text: "Sarah Levy", fontScale: 1 }
    ]);
  });

  it("turns lowercase letters into reduced uppercase small-cap runs", () => {
    expect(styledTextRuns("Sarah McKay 12", { ...baseStyle, smallCaps: true })).toEqual([
      { text: "S", fontScale: 1 },
      { text: "ARAH", fontScale: SMALL_CAPS_FONT_SCALE },
      { text: " M", fontScale: 1 },
      { text: "C", fontScale: SMALL_CAPS_FONT_SCALE },
      { text: "K", fontScale: 1 },
      { text: "AY", fontScale: SMALL_CAPS_FONT_SCALE },
      { text: " 12", fontScale: 1 }
    ]);
  });

  it("lets all-caps override small-caps sizing", () => {
    expect(displayTextForStyle("Sarah Levy", { uppercase: true })).toBe("SARAH LEVY");
    expect(styledTextRuns("Sarah Levy", { uppercase: true, smallCaps: true })).toEqual([
      { text: "SARAH LEVY", fontScale: 1 }
    ]);
  });
});
