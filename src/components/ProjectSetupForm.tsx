"use client";

import type { ExportSortMode, ProjectSettings, Unit } from "@/types/placecard";
import { controlClass, Field } from "./Field";

export function ProjectSetupForm({
  settings,
  onChange
}: {
  settings: ProjectSettings;
  onChange: (settings: ProjectSettings) => void;
}) {
  return (
    <section className="grid gap-4 border border-line bg-white p-4 shadow-tool">
      <h2 className="text-base font-semibold">Card Setup</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Project name">
          <input className={controlClass} value={settings.projectName} onChange={(event) => onChange({ ...settings, projectName: event.target.value })} />
        </Field>
        <Field label="Client name">
          <input className={controlClass} value={settings.clientName} onChange={(event) => onChange({ ...settings, clientName: event.target.value })} />
        </Field>
        <Field label="Finished folded width">
          <input className={controlClass} type="number" min="0" step="0.125" value={settings.finishedWidth} onChange={(event) => onChange({ ...settings, finishedWidth: Number(event.target.value) })} />
        </Field>
        <Field label="Finished folded height">
          <input className={controlClass} type="number" min="0" step="0.125" value={settings.finishedHeight} onChange={(event) => onChange({ ...settings, finishedHeight: Number(event.target.value) })} />
        </Field>
        <Field label="Unit">
          <select className={controlClass} value={settings.unit} onChange={(event) => onChange({ ...settings, unit: event.target.value as Unit })}>
            <option value="in">Inches</option>
            <option value="mm">Millimeters</option>
          </select>
        </Field>
        <Field label="Fold type">
          <select className={controlClass} value={settings.foldType} onChange={(event) => onChange({ ...settings, foldType: event.target.value as ProjectSettings["foldType"] })}>
            <option value="horizontal-tent">Horizontal tent</option>
          </select>
        </Field>
        <Field label="Export sort order">
          <select
            className={controlClass}
            value={settings.exportSortMode}
            onChange={(event) => onChange({ ...settings, exportSortMode: event.target.value as ExportSortMode })}
          >
            <option value="table">Sort by Table</option>
            <option value="last-name">Sort by Last Name</option>
          </select>
        </Field>
        <Field label="Bleed" hint="Default is 0.125 inch equivalent.">
          <input className={controlClass} type="number" min="0" step="0.025" value={settings.bleed} onChange={(event) => onChange({ ...settings, bleed: Number(event.target.value) })} />
        </Field>
        <Field label="Safe margin">
          <input className={controlClass} type="number" min="0" step="0.025" value={settings.safeMargin} onChange={(event) => onChange({ ...settings, safeMargin: Number(event.target.value) })} />
        </Field>
      </div>
    </section>
  );
}
