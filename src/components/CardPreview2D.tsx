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
  const ratio = layout.finishedHeightPt / layout.finishedWidthPt;

  return (
    <div className="border border-line bg-white p-4 shadow-tool">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">PDF Page Preview</h2>
        <span className="text-xs text-neutral-500">
          {formatInchesFromPoints(layout.finishedWidthPt)} x {formatInchesFromPoints(layout.finishedHeightPt)}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className="mx-auto w-full max-w-[360px] border border-ink bg-paper"
          style={{ aspectRatio: `1 / ${ratio}` }}
        >
          <div className="relative h-full">
            <span className="absolute left-2 top-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Front
            </span>
          <PanelPreview
            text={guest?.name || "Guest Name"}
            logo={settings.includeLogo ? settings.logo?.dataUrl : undefined}
            showLogo={settings.logo?.placement === "above-name" || settings.logo?.placement === "both-panels"}
            fontSize={settings.nameText.fontSize}
            weight={settings.nameText.fontWeight}
            fontFamily={styleCssFontFamily(settings.nameText)}
            color={settings.nameText.color}
          />
          </div>
        </div>
        <div
          className="mx-auto w-full max-w-[360px] border border-ink bg-paper"
          style={{ aspectRatio: `1 / ${ratio}` }}
        >
          <div className="relative h-full">
            <span className="absolute left-2 top-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Back
            </span>
          <PanelPreview
            text={guest?.tableLabel || "Table 12"}
            logo={settings.includeLogo ? settings.logo?.dataUrl : undefined}
            showLogo={settings.logo?.placement === "above-table" || settings.logo?.placement === "both-panels"}
            fontSize={settings.tableText.fontSize}
            weight={settings.tableText.fontWeight}
            fontFamily={styleCssFontFamily(settings.tableText)}
            color={settings.tableText.color}
          />
          </div>
        </div>
      </div>
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
