import type { ReactNode } from "react";

export function Field({
  label,
  children,
  hint
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-ink">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-neutral-500">{hint}</span> : null}
    </label>
  );
}

export const controlClass =
  "h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/15";
