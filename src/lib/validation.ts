import type { GuestRow, ProjectSettings } from "@/types/placecard";

export function validateSettings(settings: ProjectSettings): string[] {
  const warnings: string[] = [];
  if (!settings.projectName.trim()) warnings.push("Project name is blank.");
  if (settings.finishedWidth <= 0 || settings.finishedHeight <= 0) {
    warnings.push("Finished folded size must be greater than zero.");
  }
  if (settings.safeMargin < 0 || settings.bleed < 0) {
    warnings.push("Bleed and safe margin cannot be negative.");
  }
  if (settings.includeLogo && settings.logo) {
    warnings.push(...settings.logo.warnings);
  }
  if (settings.nameText.fontMode === "google" || settings.tableText.fontMode === "google") {
    warnings.push("Google Fonts override is used in previews; print PDFs currently use the nearest curated PDF font.");
  }
  return warnings;
}

export function summarizeGuestWarnings(guests: GuestRow[]): string[] {
  const warnings: string[] = [];
  const duplicateCount = guests.filter((guest) =>
    guest.warnings.some((warning) => warning.includes("Duplicate"))
  ).length;
  const blankTables = guests.filter((guest) =>
    guest.warnings.some((warning) => warning.includes("Blank table"))
  ).length;

  if (!guests.length) warnings.push("No valid guest names have been imported.");
  if (blankTables) warnings.push(`${blankTables} blank table value${blankTables === 1 ? "" : "s"}.`);
  if (duplicateCount) warnings.push(`${duplicateCount} duplicate guest name warning${duplicateCount === 1 ? "" : "s"}.`);

  return warnings;
}
