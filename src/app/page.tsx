import Link from "next/link";
import { ArrowRight, FileText, Ruler, Upload } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto grid min-h-screen max-w-6xl content-center gap-10 px-5 py-10 lg:grid-cols-[1fr_420px]">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-forest">
            Print-ready tent cards
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-ink md:text-7xl">
            Placecard Generator
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-700">
            Build folded placecard proofs and single-up print PDFs from a guest list,
            with the front panel rotated correctly on the flat sheet.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-md bg-forest px-5 py-3 text-sm font-semibold text-white shadow-tool transition hover:bg-[#1f3c32]"
            >
              Start a project
              <ArrowRight size={18} />
            </Link>
            <a
              href="/demo/demo-guests.csv"
              className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-forest"
            >
              <FileText size={18} />
              Demo CSV
            </a>
          </div>
        </div>
        <div className="self-center border border-line bg-white p-5 shadow-tool">
          <div className="aspect-[3.5/4] border border-dashed border-brass bg-paper p-4">
            <div className="grid h-full grid-rows-2">
              <div className="flex rotate-180 items-center justify-center border-b border-dashed border-brass text-center text-2xl font-semibold">
                Guest Name
              </div>
              <div className="flex items-center justify-center text-center text-lg">
                Table 12
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-neutral-700">
            <span className="flex items-center gap-2">
              <Ruler size={16} /> Exact flat size
            </span>
            <span className="flex items-center gap-2">
              <Upload size={16} /> CSV/XLSX import
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
