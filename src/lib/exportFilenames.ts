import type { OutputMode } from "@/types/placecard";

const UNSAFE_FILENAME_CHARS = /[<>:"/\\|?*\u0000-\u001f]/g;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatLocalExportTimestamp(date = new Date()): string {
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const year = pad2(date.getFullYear() % 100);
  const hour24 = date.getHours();
  const hour12 = hour24 % 12 || 12;
  const minute = pad2(date.getMinutes());
  const period = hour24 >= 12 ? "pm" : "am";

  return `${month}.${day}.${year} ${pad2(hour12)}${minute} ${period}`;
}

export function sanitizeFilenamePart(value: string, fallback: string): string {
  const sanitized = value
    .replace(UNSAFE_FILENAME_CHARS, " ")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/\.+$/g, "");

  return sanitized || fallback;
}

export function outputModeFilenameLabel(outputMode: OutputMode): string {
  return outputMode === "proof" ? "proof" : "print-ready";
}

export function buildPdfFilename(projectName: string, outputMode: OutputMode, date = new Date()): string {
  const baseName = sanitizeFilenamePart(projectName, "placecards");
  const timestamp = formatLocalExportTimestamp(date);

  return `${baseName}_${outputModeFilenameLabel(outputMode)}_${timestamp}.pdf`;
}
