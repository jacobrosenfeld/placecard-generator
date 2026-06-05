"use client";

import type { LogoPlacement, LogoSettings, ProjectSettings } from "@/types/placecard";
import { controlClass, Field } from "./Field";

async function readLogo(file: File): Promise<LogoSettings> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const warnings: string[] = [];
  let naturalWidth: number | undefined;
  let naturalHeight: number | undefined;

  if (file.type !== "image/svg+xml") {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
    naturalWidth = image.naturalWidth;
    naturalHeight = image.naturalHeight;
    if (naturalWidth < 500 || naturalHeight < 180) {
      warnings.push("Raster logo may be low resolution for print at larger sizes.");
    }
  }

  return {
    fileName: file.name,
    dataUrl,
    mimeType: file.type,
    placement: "above-name",
    maxWidthPercent: 45,
    maxHeightPercent: 22,
    naturalWidth,
    naturalHeight,
    warnings
  };
}

export function LogoUploader({
  settings,
  onChange
}: {
  settings: ProjectSettings;
  onChange: (settings: ProjectSettings) => void;
}) {
  const logo = settings.logo;

  return (
    <section className="grid gap-4 border border-line bg-white p-4 shadow-tool">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Logo</h2>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={settings.includeLogo}
            onChange={(event) => onChange({ ...settings, includeLogo: event.target.checked })}
          />
          Include
        </label>
      </div>
      <Field label="Upload PNG, JPG, or SVG">
        <input
          className={controlClass}
          type="file"
          accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const nextLogo = await readLogo(file);
            onChange({ ...settings, includeLogo: true, logo: nextLogo });
          }}
        />
      </Field>
      {logo ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Placement">
            <select
              className={controlClass}
              value={logo.placement}
              onChange={(event) => onChange({ ...settings, logo: { ...logo, placement: event.target.value as LogoPlacement } })}
            >
              <option value="above-name">Above name</option>
              <option value="below-name">Below name</option>
              <option value="above-table">Above table</option>
              <option value="both-panels">Both panels</option>
            </select>
          </Field>
          <Field label="Max width %">
            <input className={controlClass} type="number" min="5" max="100" value={logo.maxWidthPercent} onChange={(event) => onChange({ ...settings, logo: { ...logo, maxWidthPercent: Number(event.target.value) } })} />
          </Field>
          <Field label="Max height %">
            <input className={controlClass} type="number" min="5" max="60" value={logo.maxHeightPercent} onChange={(event) => onChange({ ...settings, logo: { ...logo, maxHeightPercent: Number(event.target.value) } })} />
          </Field>
          <div className="sm:col-span-3 flex items-center gap-3 rounded-md bg-paper p-3 text-sm text-neutral-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" src={logo.dataUrl} className="h-10 w-16 object-contain" />
            <span>{logo.fileName}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
