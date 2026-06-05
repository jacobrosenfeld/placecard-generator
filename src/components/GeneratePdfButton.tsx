"use client";

import { Download } from "lucide-react";
import { generatePlacecardPdf } from "@/lib/pdfGenerator";
import type { GuestRow, OutputMode, ProjectSettings } from "@/types/placecard";

export function GeneratePdfButton({
  settings,
  guests,
  outputMode
}: {
  settings: ProjectSettings;
  guests: GuestRow[];
  outputMode: OutputMode;
}) {
  return (
    <button
      type="button"
      disabled={!guests.length}
      onClick={async () => {
        const bytes = await generatePlacecardPdf({ settings, guests, outputMode });
        const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const blob = new Blob([arrayBuffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${settings.projectName || "placecards"}-${outputMode}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      }}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-forest px-4 text-sm font-semibold text-white transition hover:bg-[#1f3c32] disabled:cursor-not-allowed disabled:bg-neutral-300"
    >
      <Download size={18} />
      {outputMode === "proof" ? "Generate Proof PDF" : "Generate Print PDF"}
    </button>
  );
}
