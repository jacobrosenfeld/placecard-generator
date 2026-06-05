"use client";

import type { GuestRow, ParsedGuestList } from "@/types/placecard";
import { mapGuestRows, parseGuestListFile } from "@/lib/parseGuestList";
import { controlClass, Field } from "./Field";

export function GuestListUploader({
  parsed,
  guests,
  nameColumnIndex,
  tableColumnIndex,
  onParsed,
  onMappingChange
}: {
  parsed?: ParsedGuestList;
  guests: GuestRow[];
  nameColumnIndex: number;
  tableColumnIndex: number;
  onParsed: (parsed: ParsedGuestList, guests: GuestRow[]) => void;
  onMappingChange: (nameColumnIndex: number, tableColumnIndex: number, guests: GuestRow[]) => void;
}) {
  return (
    <section className="grid gap-4 border border-line bg-white p-4 shadow-tool">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Guest List</h2>
        <span className="text-xs font-medium text-neutral-500">{guests.length} cards ready</span>
      </div>
      <Field label="Upload CSV, XLSX, or XLS">
        <input
          className={controlClass}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const nextParsed = await parseGuestListFile(file);
            const nextGuests = mapGuestRows(nextParsed, nextParsed.nameColumnIndex, nextParsed.tableColumnIndex);
            onParsed(nextParsed, nextGuests);
          }}
        />
      </Field>

      {parsed ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name column">
              <select
                className={controlClass}
                value={nameColumnIndex}
                onChange={(event) => {
                  const nextName = Number(event.target.value);
                  onMappingChange(nextName, tableColumnIndex, mapGuestRows(parsed, nextName, tableColumnIndex));
                }}
              >
                {parsed.columns.map((column, index) => (
                  <option key={`${column}-${index}`} value={index}>
                    {column}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Table column">
              <select
                className={controlClass}
                value={tableColumnIndex}
                onChange={(event) => {
                  const nextTable = Number(event.target.value);
                  onMappingChange(nameColumnIndex, nextTable, mapGuestRows(parsed, nameColumnIndex, nextTable));
                }}
              >
                {parsed.columns.map((column, index) => (
                  <option key={`${column}-${index}`} value={index}>
                    {column}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="overflow-hidden border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Last name</th>
                  <th className="px-3 py-2">Table</th>
                  <th className="px-3 py-2">Warnings</th>
                </tr>
              </thead>
              <tbody>
                {guests.slice(0, 10).map((guest) => (
                  <tr key={guest.id} className="border-t border-line">
                    <td className="px-3 py-2 text-neutral-500">{guest.sourceRowNumber}</td>
                    <td className="px-3 py-2 font-medium">{guest.name}</td>
                    <td className="px-3 py-2">{guest.lastName}</td>
                    <td className="px-3 py-2">{guest.tableLabel}</td>
                    <td className="px-3 py-2 text-clay">{guest.warnings.join(" ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="rounded-md bg-paper p-3 text-sm text-neutral-600">
          Expected default columns are Name and Table. You can remap columns after upload.
        </p>
      )}
    </section>
  );
}
