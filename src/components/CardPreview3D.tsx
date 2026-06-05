"use client";

import type { GuestRow, ProjectSettings } from "@/types/placecard";
import { styleCssFontFamily, styleCssFontWeight } from "@/lib/typography";

export type PreviewState = "flat" | "folded" | "rotating" | "open";

export function CardPreview3D({
  guest,
  settings,
  state,
  onStateChange
}: {
  guest?: GuestRow;
  settings: ProjectSettings;
  state: PreviewState;
  onStateChange: (state: PreviewState) => void;
}) {
  const showFlatRotation = state === "flat";
  const nameStyle = {
    color: settings.nameText.color,
    fontFamily: styleCssFontFamily(settings.nameText),
    fontWeight: styleCssFontWeight(settings.nameText),
    WebkitTextStroke: settings.nameText.fontWeight === "bold" ? "0.2px currentColor" : undefined
  };
  const tableStyle = {
    color: settings.tableText.color,
    fontFamily: styleCssFontFamily(settings.tableText),
    fontWeight: styleCssFontWeight(settings.tableText),
    WebkitTextStroke: settings.tableText.fontWeight === "bold" ? "0.2px currentColor" : undefined
  };

  return (
    <div className="border border-line bg-white p-4 shadow-tool">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Fold Preview</h2>
        <div className="flex rounded-md border border-line bg-paper p-1">
          {(["flat", "folded", "rotating", "open"] as PreviewState[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onStateChange(item)}
              className={`rounded px-2.5 py-1 text-xs font-semibold capitalize ${
                state === item ? "bg-forest text-white" : "text-neutral-600 hover:bg-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="card3d-scene flex h-72 items-center justify-center overflow-hidden bg-paper">
        <div className="card3d h-52 w-80" data-state={state}>
          <div className="card3d-panel card3d-top absolute left-0 top-0 flex h-1/2 w-full flex-col items-center justify-center gap-2 border border-ink bg-white p-5 text-center shadow-sm transition-transform duration-700">
            <span className="absolute left-2 top-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Outside
            </span>
            {settings.includeLogo && settings.logo?.dataUrl && (settings.logo.placement === "above-name" || settings.logo.placement === "both-panels") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" src={settings.logo.dataUrl} className="max-h-10 max-w-28 object-contain" />
            ) : null}
            <span
              className={`card3d-name-content text-xl leading-tight transition-transform duration-500 ${showFlatRotation ? "rotate-180" : ""}`}
              style={nameStyle}
            >
              {guest?.name || "Guest Name"}
            </span>
          </div>
          <div className="card3d-panel card3d-bottom absolute bottom-0 left-0 flex h-1/2 w-full items-center justify-center border border-t-0 border-ink bg-[#fffdf8] p-5 text-center shadow-sm transition-transform duration-700">
            <span className="absolute left-2 top-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Inside
            </span>
            <span className="text-lg" style={tableStyle}>{guest?.tableLabel || "Table 12"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
