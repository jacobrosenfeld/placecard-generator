"use client";

import type { CardLayout, GuestRow, ProjectSettings } from "@/types/placecard";

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
        <h2 className="text-base font-semibold">Flat PDF Preview</h2>
        <span className="text-xs text-neutral-500">
          {layout.flatWidthPt.toFixed(1)} x {layout.flatHeightPt.toFixed(1)} pt
        </span>
      </div>
      <div
        className="mx-auto w-full max-w-[360px] border border-ink bg-paper"
        style={{ aspectRatio: `1 / ${ratio}` }}
      >
        <div className="grid h-full grid-rows-2">
          <PanelPreview
            className="rotate-180 border-b border-dashed border-brass"
            text={guest?.name || "Guest Name"}
            logo={settings.includeLogo ? settings.logo?.dataUrl : undefined}
            showLogo={settings.logo?.placement === "above-name" || settings.logo?.placement === "both-panels"}
            fontSize={settings.nameText.fontSize}
            weight={settings.nameText.fontWeight}
          />
          <PanelPreview
            text={guest?.tableLabel || "Table 12"}
            logo={settings.includeLogo ? settings.logo?.dataUrl : undefined}
            showLogo={settings.logo?.placement === "above-table"}
            fontSize={settings.tableText.fontSize}
            weight={settings.tableText.fontWeight}
          />
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
  className = ""
}: {
  text: string;
  logo?: string;
  showLogo?: boolean;
  fontSize: number;
  weight: "normal" | "bold";
  className?: string;
}) {
  return (
    <div className={`flex min-h-0 flex-col items-center justify-center gap-2 p-5 text-center ${className}`}>
      {showLogo && logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" src={logo} className="max-h-[32%] max-w-[58%] object-contain" />
      ) : null}
      <div
        className="max-w-full overflow-hidden text-balance leading-tight"
        style={{ fontSize: `${Math.min(fontSize, 34)}px`, fontWeight: weight }}
      >
        {text}
      </div>
    </div>
  );
}
