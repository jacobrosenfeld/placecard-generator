import type { Unit } from "@/types/placecard";

export const POINTS_PER_INCH = 72;
export const MM_PER_INCH = 25.4;

export function toPoints(value: number, unit: Unit): number {
  if (!Number.isFinite(value)) return 0;
  if (unit === "in") return value * POINTS_PER_INCH;
  if (unit === "mm") return (value / MM_PER_INCH) * POINTS_PER_INCH;
  return value;
}

export function fromPoints(value: number, unit: Unit): number {
  if (unit === "in") return value / POINTS_PER_INCH;
  if (unit === "mm") return (value / POINTS_PER_INCH) * MM_PER_INCH;
  return value;
}

export function formatPoints(value: number): string {
  return `${value.toFixed(2)} pt`;
}
