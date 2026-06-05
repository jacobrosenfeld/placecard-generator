export type FitTextOptions = {
  text: string;
  maxWidth: number;
  maxHeight: number;
  initialFontSize: number;
  minFontSize: number;
  maxLines: number;
  measureText?: (text: string, fontSize: number) => number;
};

export type FitTextResult = {
  fontSize: number;
  lines: string[];
  lineHeight: number;
  didShrink: boolean;
  overflow: boolean;
};

function defaultMeasure(text: string, fontSize: number): number {
  return Array.from(text).reduce((width, char) => {
    if (char === " ") return width + fontSize * 0.28;
    if (/[\u0590-\u05FF]/.test(char)) return width + fontSize * 0.62;
    if (/[A-Z0-9]/.test(char)) return width + fontSize * 0.6;
    return width + fontSize * 0.5;
  }, 0);
}

function wrapText(text: string, fontSize: number, maxWidth: number, measure: (text: string, fontSize: number) => number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || measure(candidate, fontSize) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

export function fitTextToBox(options: FitTextOptions): FitTextResult {
  const measure = options.measureText || defaultMeasure;
  const text = options.text.trim();
  const minFontSize = Math.max(1, options.minFontSize);
  const maxLines = Math.max(1, options.maxLines);

  for (let fontSize = options.initialFontSize; fontSize >= minFontSize; fontSize -= 0.5) {
    const lines = wrapText(text, fontSize, options.maxWidth, measure).slice(0, maxLines);
    const lineHeight = fontSize * 1.18;
    const tooManyLines = wrapText(text, fontSize, options.maxWidth, measure).length > maxLines;
    const tooWide = lines.some((line) => measure(line, fontSize) > options.maxWidth);
    const tooTall = lines.length * lineHeight > options.maxHeight;

    if (!tooManyLines && !tooWide && !tooTall) {
      return {
        fontSize,
        lines,
        lineHeight,
        didShrink: fontSize < options.initialFontSize,
        overflow: false
      };
    }
  }

  const lines = wrapText(text, minFontSize, options.maxWidth, measure).slice(0, maxLines);
  return {
    fontSize: minFontSize,
    lines,
    lineHeight: minFontSize * 1.18,
    didShrink: minFontSize < options.initialFontSize,
    overflow: true
  };
}
