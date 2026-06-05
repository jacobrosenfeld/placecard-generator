"use client";

import type { ProjectSettings, TextStyle } from "@/types/placecard";
import { controlClass, Field } from "./Field";

function updateTextStyle(style: TextStyle, patch: Partial<TextStyle>): TextStyle {
  return { ...style, ...patch };
}

export function TypographyControls({
  settings,
  onChange
}: {
  settings: ProjectSettings;
  onChange: (settings: ProjectSettings) => void;
}) {
  return (
    <section className="grid gap-4 border border-line bg-white p-4 shadow-tool">
      <h2 className="text-base font-semibold">Typography</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name size">
          <input className={controlClass} type="number" min="8" max="80" value={settings.nameText.fontSize} onChange={(event) => onChange({ ...settings, nameText: updateTextStyle(settings.nameText, { fontSize: Number(event.target.value) }) })} />
        </Field>
        <Field label="Table size">
          <input className={controlClass} type="number" min="8" max="60" value={settings.tableText.fontSize} onChange={(event) => onChange({ ...settings, tableText: updateTextStyle(settings.tableText, { fontSize: Number(event.target.value) }) })} />
        </Field>
        <Field label="Minimum auto-fit size">
          <input className={controlClass} type="number" min="5" max="40" value={settings.nameText.minFontSize} onChange={(event) => {
            const minFontSize = Number(event.target.value);
            onChange({
              ...settings,
              nameText: updateTextStyle(settings.nameText, { minFontSize }),
              tableText: updateTextStyle(settings.tableText, { minFontSize: Math.min(minFontSize, settings.tableText.fontSize) })
            });
          }} />
        </Field>
        <Field label="Maximum name lines">
          <input className={controlClass} type="number" min="1" max="4" value={settings.nameText.maxLines} onChange={(event) => onChange({ ...settings, nameText: updateTextStyle(settings.nameText, { maxLines: Number(event.target.value) }) })} />
        </Field>
        <Field label="Name weight">
          <select className={controlClass} value={settings.nameText.fontWeight} onChange={(event) => onChange({ ...settings, nameText: updateTextStyle(settings.nameText, { fontWeight: event.target.value as TextStyle["fontWeight"] }) })}>
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </Field>
        <Field label="Alignment">
          <select
            className={controlClass}
            value={settings.nameText.align}
            onChange={(event) => {
              const align = event.target.value as TextStyle["align"];
              onChange({
                ...settings,
                nameText: updateTextStyle(settings.nameText, { align }),
                tableText: updateTextStyle(settings.tableText, { align })
              });
            }}
          >
            <option value="center">Center</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={settings.nameText.uppercase}
          onChange={(event) => onChange({ ...settings, nameText: updateTextStyle(settings.nameText, { uppercase: event.target.checked }) })}
        />
        Set guest names in all caps
      </label>
    </section>
  );
}
