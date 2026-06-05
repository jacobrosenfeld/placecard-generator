import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { GuestRow, ParsedGuestList } from "@/types/placecard";
import { formatTableLabel, normalizeWhitespace } from "./normalizeTableLabel";

const HEADER_HINTS = ["name", "guest", "guest name", "full name", "table", "table number", "table no"];
const HONORIFICS = new Set([
  "mr",
  "mister",
  "mrs",
  "ms",
  "miss",
  "mx",
  "dr",
  "doctor",
  "prof",
  "professor",
  "rabbi",
  "rev",
  "reverend",
  "hon",
  "judge",
  "sir",
  "dame",
  "fr",
  "father"
]);
const NAME_CONNECTORS = new Set(["and", "&"]);
const NAME_SUFFIXES = new Set(["jr", "sr", "ii", "iii", "iv", "v", "phd", "md", "esq"]);
const LAST_NAME_PARTICLES = new Set([
  "al",
  "bin",
  "ben",
  "da",
  "de",
  "del",
  "della",
  "der",
  "di",
  "du",
  "la",
  "le",
  "st",
  "saint",
  "van",
  "von"
]);

function normalizeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  return normalizeWhitespace(String(value));
}

function looksLikeHeader(row: string[]): boolean {
  const normalized = row.map((cell) => normalizeCell(cell).toLowerCase());
  const hintMatches = normalized.filter((cell) => HEADER_HINTS.includes(cell)).length;
  return hintMatches >= 1 || normalized.some((cell) => cell.includes("name")) && normalized.some((cell) => cell.includes("table"));
}

function inferColumn(columns: string[], matchers: RegExp[], fallback: number): number {
  const index = columns.findIndex((column) => matchers.some((matcher) => matcher.test(column)));
  return index >= 0 ? index : fallback;
}

function normalizeNameToken(value: string): string {
  return value.toLocaleLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

export function buildNameSortKey(value: string): string {
  return normalizeWhitespace(value)
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function stripLeadingTitles(tokens: string[]): string[] {
  let index = 0;

  while (index < tokens.length) {
    const token = normalizeNameToken(tokens[index]);
    if (HONORIFICS.has(token) || NAME_CONNECTORS.has(token)) {
      index += 1;
      continue;
    }
    break;
  }

  return tokens.slice(index);
}

function stripTrailingSuffixes(tokens: string[]): string[] {
  let end = tokens.length;

  while (end > 0 && NAME_SUFFIXES.has(normalizeNameToken(tokens[end - 1]))) {
    end -= 1;
  }

  return tokens.slice(0, end);
}

function lastNameFromTokens(tokens: string[]): string {
  const cleanedTokens = stripTrailingSuffixes(stripLeadingTitles(tokens)).filter((token) => normalizeNameToken(token));
  if (!cleanedTokens.length) return "";
  if (cleanedTokens.length === 1) return cleanedTokens[0];

  let startIndex = cleanedTokens.length - 1;
  while (startIndex > 0 && LAST_NAME_PARTICLES.has(normalizeNameToken(cleanedTokens[startIndex - 1]))) {
    startIndex -= 1;
  }

  return cleanedTokens.slice(startIndex).join(" ");
}

/**
 * Extracts a best-effort last name for export sorting. Handles inverted
 * "Last, First" names, common honorifics, joined titles, multi-word last-name
 * particles such as "Van" and "de la", and falls back to the full name token.
 */
export function extractLastName(fullName: string): string {
  const name = normalizeWhitespace(fullName);
  if (!name) return "";

  const [invertedLastName] = name.split(",");
  if (name.includes(",") && invertedLastName) {
    const invertedTokens = normalizeWhitespace(invertedLastName).split(" ");
    return lastNameFromTokens(invertedTokens) || invertedLastName;
  }

  return lastNameFromTokens(name.split(" ")) || name;
}

export function buildTableSortKey(tableRaw: string, tableLabel: string): string {
  const source = normalizeWhitespace(tableRaw || tableLabel);
  const numericMatch = source.match(/\d+/);

  if (numericMatch) return `0-${Number(numericMatch[0]).toString().padStart(8, "0")}-${buildNameSortKey(source)}`;
  if (!source) return "2";

  return `1-${buildNameSortKey(source)}`;
}

export async function parseGuestListFile(file: File): Promise<ParsedGuestList> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    const text = await file.text();
    const parsed = Papa.parse<string[]>(text, { skipEmptyLines: "greedy" });
    if (parsed.errors.length) {
      return parseMatrix([], [`CSV parse warning: ${parsed.errors[0]?.message}`]);
    }
    return parseMatrix(parsed.data);
  }

  if (extension === "xlsx" || extension === "xls") {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1, blankrows: false });
    return parseMatrix(rows);
  }

  return parseMatrix([], ["Unsupported file type. Upload a CSV, XLSX, or XLS file."]);
}

export function parseMatrix(rows: unknown[][], initialWarnings: string[] = []): ParsedGuestList {
  const cleanedRows = rows
    .map((row) => row.map(normalizeCell))
    .filter((row) => row.some(Boolean));

  if (!cleanedRows.length) {
    return {
      columns: [],
      rows: [],
      hasHeader: false,
      nameColumnIndex: 0,
      tableColumnIndex: 1,
      warnings: [...initialWarnings, "No rows were found in the uploaded file."]
    };
  }

  const hasHeader = looksLikeHeader(cleanedRows[0]);
  const maxColumns = Math.max(...cleanedRows.map((row) => row.length));
  const columns = hasHeader
    ? cleanedRows[0].map((cell, index) => cell || `Column ${index + 1}`)
    : Array.from({ length: maxColumns }, (_, index) => `Column ${index + 1}`);

  return {
    columns,
    rows: hasHeader ? cleanedRows.slice(1) : cleanedRows,
    hasHeader,
    nameColumnIndex: inferColumn(columns.map((column) => column.toLowerCase()), [/name/, /guest/], 0),
    tableColumnIndex: inferColumn(columns.map((column) => column.toLowerCase()), [/table/], 1),
    warnings: initialWarnings
  };
}

export function mapGuestRows(parsed: ParsedGuestList, nameColumnIndex: number, tableColumnIndex: number): GuestRow[] {
  const seen = new Map<string, number>();
  const guests = parsed.rows
    .map((row, rowIndex) => {
      const name = normalizeWhitespace(row[nameColumnIndex] || "");
      const tableRaw = normalizeWhitespace(row[tableColumnIndex] || "");
      const tableLabel = formatTableLabel(tableRaw);
      const lastName = extractLastName(name);
      const warnings: string[] = [];
      const normalizedName = name.toLocaleLowerCase();

      if (!name) warnings.push("Guest name is blank and will be skipped.");
      if (!tableRaw) warnings.push("Blank table value.");
      if (name) seen.set(normalizedName, (seen.get(normalizedName) || 0) + 1);

      return {
        id: `${rowIndex + 1}-${name || "blank"}`,
        name,
        tableRaw,
        tableLabel,
        lastName,
        nameSortKey: buildNameSortKey(lastName || name),
        tableSortKey: buildTableSortKey(tableRaw, tableLabel),
        sourceRowNumber: parsed.hasHeader ? rowIndex + 2 : rowIndex + 1,
        warnings
      };
    })
    .filter((guest) => guest.name);

  return guests.map((guest) => {
    if ((seen.get(guest.name.toLocaleLowerCase()) || 0) > 1) {
      return { ...guest, warnings: [...guest.warnings, "Duplicate guest name."] };
    }
    return guest;
  });
}
