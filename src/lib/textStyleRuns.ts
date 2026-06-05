import type { TextStyle } from "@/types/placecard";

export const SMALL_CAPS_FONT_SCALE = 0.78;

export type StyledTextRun = {
  text: string;
  fontScale: number;
};

function isLowercaseLetter(character: string): boolean {
  return character.toLocaleLowerCase() === character && character.toLocaleUpperCase() !== character;
}

export function displayTextForStyle(text: string, style: Pick<TextStyle, "uppercase">): string {
  return style.uppercase ? text.toLocaleUpperCase() : text;
}

export function styledTextRuns(text: string, style: Pick<TextStyle, "uppercase" | "smallCaps">): StyledTextRun[] {
  const displayText = displayTextForStyle(text, style);
  const runs: StyledTextRun[] = [];

  for (const character of displayText) {
    const useSmallCap = style.smallCaps && isLowercaseLetter(character);
    const nextRun = {
      text: useSmallCap ? character.toLocaleUpperCase() : character,
      fontScale: useSmallCap ? SMALL_CAPS_FONT_SCALE : 1
    };
    const currentRun = runs[runs.length - 1];

    if (currentRun && currentRun.fontScale === nextRun.fontScale) {
      currentRun.text += nextRun.text;
    } else {
      runs.push(nextRun);
    }
  }

  return runs.length ? runs : [{ text: "", fontScale: 1 }];
}
