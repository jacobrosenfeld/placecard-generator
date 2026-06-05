"use client";

import type { CardLayout, GuestRow, ProjectSettings } from "@/types/placecard";
import { styleCssFontFamily } from "@/lib/typography";
import { formatInchesFromPoints } from "@/lib/units";

export function CardPreview2D({
  layout,
  guest,
  settings
}: {
  layout: CardLayout;
  guest?: GuestRow;
  settings: ProjectSettings;
}) {
  const ratio = layout.flatHeightPt / layout.flatWidthPt;

  return (
    <div className="border border-line bg-white p-4 shadow-tool">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Imposed PDF Preview</h2>
        <span className="text-xs text-neutral-500">
          {formatInchesFromPoints(layout.flatWidthPt)} x {formatInchesFromPoints(layout.flatHeightPt)}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className="mx-auto w-full max-w-[360px] border border-ink bg-paper"
          style={{ aspectRatio: `1 / ${ratio}` }}
        >
          <div className="relative h-full">
            <span className="absolute left-2 top-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Side 1
            </span>
            <div className="grid h-full grid-rows-2">
              <BlankHalf label="Blank top" />
              <PanelPreview
                text={guest?.name || "Guest Name"}
                logo={settings.includeLogo ? settings.logo?.dataUrl : undefined}
                showLogo={settings.logo?.placement === "above-name" || settings.logo?.placement === "both-panels"}
                fontSize={settings.nameText.fontSize}
                weight={settings.nameText.fontWeight}
                fontFamily={styleCssFontFamily(settings.nameText)}
                color={settings.nameText.color}
                className="border-t border-dashed border-brass"
              />
            </div>
          </div>
        </div>
        <div
          className="mx-auto w-full max-w-[360px] border border-ink bg-paper"
          style={{ aspectRatio: `1 / ${ratio}` }}
        >
          <div className="relative h-full">
            <span className="absolute left-2 top-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Side 2
            </span>
            <div className="grid h-full grid-rows-2">
              <PanelPreview
                text={guest?.tableLabel || "Table 12"}
                logo={settings.includeLogo ? settings.logo?.dataUrl : undefined}
                showLogo={settings.logo?.placement === "above-table" || settings.logo?.placement === "both-panels"}
                fontSize={settings.tableText.fontSize}
                weight={settings.tableText.fontWeight}
                fontFamily={styleCssFontFamily(settings.tableText)}
                color={settings.tableText.color}
                className="rotate-180 border-b border-dashed border-brass"
              />
              <BlankHalf label="Blank bottom" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlankHalf({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-neutral-300">
      {label}
    </div>
  );
}

function PanelPreview({
  text,
  logo,
  showLogo,
  fontSize,
  weight,
  fontFamily,
  color,
  className = ""
}: {
  text: string;
  logo?: string;
  showLogo?: boolean;
  fontSize: number;
  weight: "normal" | "bold";
  fontFamily: string;
  color: string;
  className?: string;
}) {
  return (
    <div className={`flex h-full min-h-0 flex-col items-center justify-center gap-2 p-5 text-center ${className}`}>
      {showLogo && logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" src={logo} className="max-h-[32%] max-w-[58%] object-contain" />
      ) : null}
      <div
        className="max-w-full overflow-hidden text-balance leading-tight"
        style={{
          color,
          fontFamily,
          fontSize: `${Math.min(fontSize, 34)}px`,
          fontWeight: weight
        }}
      >
        {text}
      </div>
    </div>
  );
}
