import { cmyk } from "pdf-lib";
import type { Color } from "pdf-lib";
import type { CmykColor, TextColor } from "@/types/placecard";

export type CmykChannels = {
  c: number;
  m: number;
  y: number;
  k: number;
};

const FALLBACK_HEX = "#202124";
const CHANNEL_MAX = 100;

function clampChannel(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(CHANNEL_MAX, Math.max(0, value));
}

function channelToUnit(value: number): number {
  return clampChannel(value) / CHANNEL_MAX;
}

function toHexByte(value: number): string {
  return Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, "0");
}

export function normalizeHexColor(value: string): string | undefined {
  const cleaned = value.trim();
  const shortMatch = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(cleaned);
  if (shortMatch) {
    return `#${shortMatch[1]}${shortMatch[1]}${shortMatch[2]}${shortMatch[2]}${shortMatch[3]}${shortMatch[3]}`.toLowerCase();
  }

  const match = /^#?([a-f\d]{6})$/i.exec(cleaned);
  if (!match) return undefined;

  return `#${match[1]}`.toLowerCase();
}

export function parseCmykChannel(value: string | number): number | undefined {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > CHANNEL_MAX) return undefined;
  return parsed;
}

export function isCmykColor(value: TextColor): value is CmykColor {
  return typeof value === "object" && value !== null && value.mode === "cmyk";
}

export function hexToCmykChannels(value: string): CmykChannels {
  const hex = normalizeHexColor(value) || FALLBACK_HEX;
  const red = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const green = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(hex.slice(5, 7), 16) / 255;
  const key = 1 - Math.max(red, green, blue);

  if (key === 1) return { c: 0, m: 0, y: 0, k: 100 };

  return {
    c: ((1 - red - key) / (1 - key)) * 100,
    m: ((1 - green - key) / (1 - key)) * 100,
    y: ((1 - blue - key) / (1 - key)) * 100,
    k: key * 100
  };
}

export function cmykToHexColor(channels: CmykChannels): string {
  const cyan = channelToUnit(channels.c);
  const magenta = channelToUnit(channels.m);
  const yellow = channelToUnit(channels.y);
  const key = channelToUnit(channels.k);
  const red = 255 * (1 - cyan) * (1 - key);
  const green = 255 * (1 - magenta) * (1 - key);
  const blue = 255 * (1 - yellow) * (1 - key);

  return `#${toHexByte(red)}${toHexByte(green)}${toHexByte(blue)}`;
}

export function textColorToPreviewHex(color: TextColor): string {
  if (isCmykColor(color)) return cmykToHexColor(color);
  return normalizeHexColor(color) || FALLBACK_HEX;
}

export function textColorToCmykChannels(color: TextColor): CmykChannels {
  if (isCmykColor(color)) {
    return {
      c: clampChannel(color.c),
      m: clampChannel(color.m),
      y: clampChannel(color.y),
      k: clampChannel(color.k)
    };
  }

  return hexToCmykChannels(color);
}

export function textColorToPdfCmyk(color: TextColor): Color {
  const channels = textColorToCmykChannels(color);
  return cmyk(
    channelToUnit(channels.c),
    channelToUnit(channels.m),
    channelToUnit(channels.y),
    channelToUnit(channels.k)
  );
}

export function validateTextColor(color: TextColor, label: string): string[] {
  if (isCmykColor(color)) {
    const invalidChannels = (["c", "m", "y", "k"] as const).filter((channel) =>
      parseCmykChannel(color[channel]) === undefined
    );

    return invalidChannels.map((channel) => `${label} CMYK ${channel.toUpperCase()} must be between 0 and 100.`);
  }

  return normalizeHexColor(color) ? [] : [`${label} hex color must be a valid 3- or 6-digit hex value.`];
}
