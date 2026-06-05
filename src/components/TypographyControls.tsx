"use client";

import { useEffect } from "react";
import type { ProjectSettings, TextStyle } from "@/types/placecard";
import { CURATED_FONTS, googleFontsHref } from "@/lib/typography";
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
  useEffect(() => {
    const overrides = [settings.nameText, settings.tableText]
      .filter((style) => style.fontMode === "google" && style.googleFontFamily.trim())
      .map((style) => googleFontsHref(style.googleFontFamily));

    for (const href of overrides) {
      if (document.querySelector(`link[href="${href}"]`)) continue;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  }, [settings.nameText, settings.tableText]);

  return (
    <section className="grid gap-4 border border-line bg-white p-4 shadow-tool">
      <h2 className="text-base font-semibold">Typography</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name font">
          <select
            className={controlClass}
            value={settings.nameText.fontMode === "google" ? "google" : settings.nameText.fontFamily}
            onChange={(event) => {
              if (event.target.value === "google") {
                onChange({ ...settings, nameText: updateTextStyle(settings.nameText, { fontMode: "google" }) });
                return;
              }

              onChange({
                ...settings,
                nameText: updateTextStyle(settings.nameText, {
                  fontMode: "curated",
                  fontFamily: event.target.value
                })
              });
            }}
          >
            {CURATED_FONTS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
            <option value="google">Google Fonts override</option>
          </select>
        </Field>
        <Field label="Table font">
          <select
            className={controlClass}
            value={settings.tableText.fontMode === "google" ? "google" : settings.tableText.fontFamily}
            onChange={(event) => {
              if (event.target.value === "google") {
                onChange({ ...settings, tableText: updateTextStyle(settings.tableText, { fontMode: "google" }) });
                return;
              }

              onChange({
                ...settings,
                tableText: updateTextStyle(settings.tableText, {
                  fontMode: "curated",
                  fontFamily: event.target.value
                })
              });
            }}
          >
            {CURATED_FONTS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
            <option value="google">Google Fonts override</option>
          </select>
        </Field>
        {settings.nameText.fontMode === "google" ? (
          <Field label="Name Google Font" hint="Use Family or Family@weight, for example Cormorant Garamond@600.">
            <input
              className={controlClass}
              value={settings.nameText.googleFontFamily}
              onChange={(event) => onChange({ ...settings, nameText: updateTextStyle(settings.nameText, { googleFontFamily: event.target.value }) })}
            />
          </Field>
        ) : null}
        {settings.tableText.fontMode === "google" ? (
          <Field label="Table Google Font" hint="Use Family or Family@weight, for example Cormorant Garamond@400.">
            <input
              className={controlClass}
              value={settings.tableText.googleFontFamily}
              onChange={(event) => onChange({ ...settings, tableText: updateTextStyle(settings.tableText, { googleFontFamily: event.target.value }) })}
            />
          </Field>
        ) : null}
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
        <Field label="Name color">
          <div className="grid grid-cols-[48px_1fr] gap-2">
            <input
              aria-label="Name text color"
              className="h-10 w-12 rounded-md border border-line bg-white p-1"
              type="color"
              value={settings.nameText.color}
              onChange={(event) => onChange({ ...settings, nameText: updateTextStyle(settings.nameText, { color: event.target.value }) })}
            />
            <input
              className={controlClass}
              value={settings.nameText.color}
              onChange={(event) => onChange({ ...settings, nameText: updateTextStyle(settings.nameText, { color: event.target.value }) })}
            />
          </div>
        </Field>
        <Field label="Table color">
          <div className="grid grid-cols-[48px_1fr] gap-2">
            <input
              aria-label="Table text color"
              className="h-10 w-12 rounded-md border border-line bg-white p-1"
              type="color"
              value={settings.tableText.color}
              onChange={(event) => onChange({ ...settings, tableText: updateTextStyle(settings.tableText, { color: event.target.value }) })}
            />
            <input
              className={controlClass}
              value={settings.tableText.color}
              onChange={(event) => onChange({ ...settings, tableText: updateTextStyle(settings.tableText, { color: event.target.value }) })}
            />
          </div>
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
