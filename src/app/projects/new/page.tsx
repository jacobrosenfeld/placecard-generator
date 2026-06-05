"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { CardPreview2D } from "@/components/CardPreview2D";
import { CardPreview3D, type PreviewState } from "@/components/CardPreview3D";
import { GeneratePdfButton } from "@/components/GeneratePdfButton";
import { GuestListUploader } from "@/components/GuestListUploader";
import { LogoUploader } from "@/components/LogoUploader";
import { ProjectSetupForm } from "@/components/ProjectSetupForm";
import { TypographyControls } from "@/components/TypographyControls";
import { buildCardLayout } from "@/lib/layoutEngine";
import { formatInchesFromPoints } from "@/lib/units";
import { summarizeGuestWarnings, validateSettings } from "@/lib/validation";
import type { GuestRow, ParsedGuestList, ProjectSettings } from "@/types/placecard";

const defaultSettings: ProjectSettings = {
  projectName: "Wedding Placecards",
  clientName: "",
  finishedWidth: 3.5,
  finishedHeight: 2,
  unit: "in",
  foldType: "horizontal-tent",
  bleed: 0.125,
  safeMargin: 0.125,
  outputMode: "single-up",
  includeLogo: false,
  nameText: {
    fontFamily: "classic-serif",
    fontMode: "curated",
    googleFontFamily: "Cormorant Garamond@600",
    fontSize: 30,
    minFontSize: 12,
    fontWeight: "bold",
    align: "center",
    uppercase: false,
    maxLines: 2,
    color: "#202124"
  },
  tableText: {
    fontFamily: "classic-serif",
    fontMode: "curated",
    googleFontFamily: "Cormorant Garamond@400",
    fontSize: 18,
    minFontSize: 10,
    fontWeight: "normal",
    align: "center",
    uppercase: false,
    maxLines: 1,
    color: "#202124"
  }
};

export default function NewProjectPage() {
  const [settings, setSettings] = useState<ProjectSettings>(defaultSettings);
  const [parsed, setParsed] = useState<ParsedGuestList>();
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [nameColumnIndex, setNameColumnIndex] = useState(0);
  const [tableColumnIndex, setTableColumnIndex] = useState(1);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewState, setPreviewState] = useState<PreviewState>("folded");

  const layout = useMemo(() => buildCardLayout(settings), [settings]);
  const selectedGuest = guests[Math.min(previewIndex, Math.max(guests.length - 1, 0))];
  const warnings = [
    ...validateSettings(settings),
    ...(parsed?.warnings || []),
    ...summarizeGuestWarnings(guests)
  ];

  return (
    <main className="min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto grid max-w-7xl gap-5">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <Link href="/" className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-forest">
              <ArrowLeft size={16} />
              Home
            </Link>
            <h1 className="text-3xl font-semibold">New placecard project</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <GeneratePdfButton settings={settings} guests={guests} outputMode="proof" />
            <GeneratePdfButton settings={settings} guests={guests} outputMode="single-up" />
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_440px]">
          <div className="grid gap-5">
            <ProjectSetupForm settings={settings} onChange={setSettings} />
            <LogoUploader settings={settings} onChange={setSettings} />
            <GuestListUploader
              parsed={parsed}
              guests={guests}
              nameColumnIndex={nameColumnIndex}
              tableColumnIndex={tableColumnIndex}
              onParsed={(nextParsed, nextGuests) => {
                setParsed(nextParsed);
                setGuests(nextGuests);
                setNameColumnIndex(nextParsed.nameColumnIndex);
                setTableColumnIndex(nextParsed.tableColumnIndex);
                setPreviewIndex(0);
              }}
              onMappingChange={(nextName, nextTable, nextGuests) => {
                setNameColumnIndex(nextName);
                setTableColumnIndex(nextTable);
                setGuests(nextGuests);
                setPreviewIndex(0);
              }}
            />
            <TypographyControls settings={settings} onChange={setSettings} />
          </div>

          <aside className="grid content-start gap-5 xl:sticky xl:top-5">
            <section className="border border-line bg-white p-4 shadow-tool">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">Production Status</h2>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-forest">
                  <CheckCircle2 size={16} />
                  {guests.length} cards
                </span>
              </div>
              {warnings.length ? (
                <div className="grid gap-2">
                  {warnings.map((warning) => (
                    <p key={warning} className="flex gap-2 rounded-md bg-[#fff7ed] p-2 text-sm text-clay">
                      <AlertTriangle className="mt-0.5 shrink-0" size={16} />
                      {warning}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="rounded-md bg-[#edf7f1] p-2 text-sm text-forest">
                  Geometry, guest data, and settings are ready for export.
                </p>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-neutral-600">
                <span>Page size: {formatInchesFromPoints(layout.finishedWidthPt)} x {formatInchesFromPoints(layout.finishedHeightPt)}</span>
                <span>Pages: front name, back table</span>
                <span>Duplex order: front then back</span>
                <span>Safe margin: {formatInchesFromPoints(layout.safeMarginPt)}</span>
              </div>
            </section>

            <section className="border border-line bg-white p-4 shadow-tool">
              <label className="grid gap-1.5 text-sm font-medium">
                Preview card
                <select
                  className="h-10 rounded-md border border-line bg-white px-3 text-sm"
                  value={previewIndex}
                  onChange={(event) => setPreviewIndex(Number(event.target.value))}
                >
                  {guests.length ? guests.map((guest, index) => (
                    <option key={guest.id} value={index}>
                      {index + 1}. {guest.name}
                    </option>
                  )) : <option value={0}>Demo card</option>}
                </select>
              </label>
            </section>

            <CardPreview2D layout={layout} guest={selectedGuest} settings={settings} />
            <CardPreview3D guest={selectedGuest} settings={settings} state={previewState} onStateChange={setPreviewState} />
          </aside>
        </div>
      </div>
    </main>
  );
}
