"use client";

import type { FontWeight, ProjectSettings, TextStyle } from "@/types/placecard";
import { CMYK_COLOR_PRESETS, textColorToCmykChannels, textColorToPreviewHex } from "@/lib/color";
import { availableFontWeights, CURATED_FONTS, FONT_WEIGHT_LABELS, normalizeFontWeight } from "@/lib/typography";
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
        <Field label="Name font">
          <select
            className={controlClass}
            value={settings.nameText.fontFamily}
            onChange={(event) => {
              const fontFamily = event.target.value;

              onChange({
                ...settings,
                nameText: updateTextStyle(settings.nameText, {
                  fontFamily,
                  fontWeight: normalizeFontWeight(fontFamily, settings.nameText.fontWeight)
                })
              });
            }}
          >
            {CURATED_FONTS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Table font">
          <select
            className={controlClass}
            value={settings.tableText.fontFamily}
            onChange={(event) => {
              const fontFamily = event.target.value;

              onChange({
                ...settings,
                tableText: updateTextStyle(settings.tableText, {
                  fontFamily,
                  fontWeight: normalizeFontWeight(fontFamily, settings.tableText.fontWeight)
                })
              });
            }}
          >
            {CURATED_FONTS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
          </select>
        </Field>
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
          <select className={controlClass} value={settings.nameText.fontWeight} onChange={(event) => onChange({ ...settings, nameText: updateTextStyle(settings.nameText, { fontWeight: event.target.value as FontWeight }) })}>
            {availableFontWeights(settings.nameText.fontFamily).map((weight) => (
              <option key={weight} value={weight}>
                {FONT_WEIGHT_LABELS[weight]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Table weight">
          <select className={controlClass} value={settings.tableText.fontWeight} onChange={(event) => onChange({ ...settings, tableText: updateTextStyle(settings.tableText, { fontWeight: event.target.value as FontWeight }) })}>
            {availableFontWeights(settings.tableText.fontFamily).map((weight) => (
              <option key={weight} value={weight}>
                {FONT_WEIGHT_LABELS[weight]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Name color">
          <TextColorControl
            label="Name"
            style={settings.nameText}
            onChange={(style) => onChange({ ...settings, nameText: style })}
          />
        </Field>
        <Field label="Table color">
          <TextColorControl
            label="Table"
            style={settings.tableText}
            onChange={(style) => onChange({ ...settings, tableText: style })}
          />
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

function TextColorControl({
  label,
  style,
  onChange
}: {
  label: string;
  style: TextStyle;
  onChange: (style: TextStyle) => void;
}) {
  const previewHex = textColorToPreviewHex(style.color);
  const cmykChannels = textColorToCmykChannels(style.color);

  function updateCmyk(channel: "c" | "m" | "y" | "k", value: number) {
    onChange({
      ...style,
      color: {
        mode: "cmyk",
        ...cmykChannels,
        [channel]: value
      }
    });
  }

  function channelGradient(channel: "c" | "m" | "y" | "k") {
    return `linear-gradient(90deg, ${textColorToPreviewHex({
      mode: "cmyk",
      ...cmykChannels,
      [channel]: 0
    })}, ${textColorToPreviewHex({
      mode: "cmyk",
      ...cmykChannels,
      [channel]: 100
    })})`;
  }

  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-[48px_1fr] gap-2">
        <span
          aria-label={`${label} text color preview`}
          className="h-10 w-12 rounded-md border border-line"
          style={{ backgroundColor: previewHex }}
        />
        <div className="flex flex-wrap gap-2">
          {CMYK_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-xs font-semibold text-ink transition hover:border-forest"
              onClick={() => onChange({ ...style, color: preset.color })}
            >
              <span
                aria-hidden="true"
                className="h-4 w-4 rounded-sm border border-line"
                style={{ backgroundColor: textColorToPreviewHex(preset.color) }}
              />
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {(["c", "m", "y", "k"] as const).map((channel) => (
          <div key={channel} className="grid gap-1.5">
            <div className="grid grid-cols-[22px_1fr_76px] items-center gap-2">
              <span className="text-xs font-semibold uppercase text-neutral-600">{channel}</span>
              <div
                aria-hidden="true"
                className="h-2 rounded-full border border-line"
                style={{ background: channelGradient(channel) }}
              />
              <input
                aria-label={`${label} ${channel.toUpperCase()} CMYK value`}
                className={controlClass}
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={cmykChannels[channel]}
                onChange={(event) => updateCmyk(channel, Number(event.target.value))}
              />
            </div>
            <input
              aria-label={`${label} ${channel.toUpperCase()} CMYK slider`}
              className="w-full cursor-pointer"
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={cmykChannels[channel]}
              onChange={(event) => updateCmyk(channel, Number(event.target.value))}
              style={{ accentColor: previewHex }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
