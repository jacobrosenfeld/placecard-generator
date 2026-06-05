export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function formatTableLabel(value: string): string {
  const cleaned = normalizeWhitespace(value || "");

  if (!cleaned) return "";

  if (/\btable\b/i.test(cleaned)) {
    return cleaned.replace(/^table\b/i, "Table");
  }

  return `Table ${cleaned}`;
}
