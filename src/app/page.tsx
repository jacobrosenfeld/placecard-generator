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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <HomeImposedSide label="Side 1" top="Blank top" bottom="Guest Name" />
            <HomeImposedSide label="Side 2" top="Table 12" bottom="Blank bottom" rotateTop />
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

function HomeImposedSide({
  label,
  top,
  bottom,
  rotateTop = false
}: {
  label: string;
  top: string;
  bottom: string;
  rotateTop?: boolean;
}) {
  return (
    <div className="border border-ink bg-paper p-3">
      <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
        <span>{label}</span>
        <span>3.5 in x 4 in</span>
      </div>
      <div className="relative aspect-[3.5/4] border border-dashed border-brass bg-white">
        <div className="grid h-full grid-rows-2">
          <div className="flex items-center justify-center px-4 text-center text-lg font-semibold text-ink">
            <span className={rotateTop ? "rotate-180" : ""}>{top}</span>
          </div>
          <div className="flex items-center justify-center px-4 text-center text-lg font-semibold text-ink">
            <span>{bottom}</span>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-1/2 w-full -translate-y-px border-t border-dashed border-brass"
        />
      </div>
    </div>
  );
}
