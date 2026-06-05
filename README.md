# Placecard Generator

Browser-first Next.js app for generating folded tent-card placecard proofs and
imposed duplex-ready print PDFs.

## License

This project is open source under the MIT License.

- Repository license: see `LICENSE`
- Third-party notices: see `THIRD_PARTY_NOTICES.md`

## Third-Party License Compliance

- Direct npm dependency licenses are documented in `THIRD_PARTY_NOTICES.md`.
- Transitive dependency licenses are recorded in `package-lock.json` and should
  be reviewed whenever dependencies change.
- Included static font assets must retain their upstream attribution and license
  terms (see `THIRD_PARTY_NOTICES.md`).

## What It Does

- Uses finished folded card size as input.
- Generates two full flat-size imposed pages per guest for duplex printing.
- Places the guest name on the bottom half of side 1.
- Places the table label on the top half of side 2, rotated 180 degrees for
  correct orientation after duplex printing and folding.
- Uses shared geometry for safe margins, previews, and PDF page sizing.
- Imports CSV, XLSX, and XLS guest lists in the browser.
- Supports column mapping, table-label cleanup, warnings, 2D preview, 3D fold
  preview, proof PDF, and print PDF export.
- Supports independent small-caps typography settings for guest names and table
  labels across previews and PDF export.
- Supports export sorting by table number or parsed guest last name. Last-name
  parsing handles common honorifics, joined titles such as
  `Mr. and Mrs. John Smith`, inverted names such as `Smith, John`, multi-word
  particles such as `de la Cruz` and `Van Dyke`, and falls back to the full
  available name when needed.
- Supports CMYK text color choosing with exact numeric entry and built-in
  presets for Gold
  (`10,23,91,22`) and 100K Black (`0,0,0,100`). Browser previews approximate
  CMYK colors in RGB for on-screen display, while generated PDFs use CMYK color
  operators for text and proof-guide drawing. Legacy hex color state is
  converted internally for compatibility. Uploaded raster logos are embedded as
  provided.
- Adds a final metadata page to Proof PDFs with the exact typography, CMYK
  color, safe margin, bleed, and layout settings used for the export.
- Exports Proof and Print-Ready PDFs with local timestamped filenames in the
  `MM.DD.YY hhmm am/pm` format.

## Local Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Useful checks:

```bash
npm run test
npm run build
```

## Demo Data

A sample guest list is available at `public/demo/demo-guests.csv`.

## Vercel Deployment

This MVP is designed for Vercel without a database or persistent uploaded-file
storage. Connect the repo in the Vercel dashboard and use the default Next.js
settings:

- Build command: `npm run build`
- Install command: `npm install`
- Output: handled by Next.js

Uploaded guest lists and logos stay in browser memory. Generated PDFs are
created client-side and downloaded by the user.

## Current Status

- Repository initialized and pushed to GitHub: https://github.com/jacobrosenfeld/placecard-generator
- Default branch: `main`

## Issue Backlog

Status of tracked issues (closed = implemented):

- [#1 Bootstrap the Next.js app shell and project structure](https://github.com/jacobrosenfeld/placecard-generator/issues/1) — Closed
- [#2 Build the shared tent-card layout engine](https://github.com/jacobrosenfeld/placecard-generator/issues/2) — Closed
- [#3 Implement guest list upload and column mapping](https://github.com/jacobrosenfeld/placecard-generator/issues/3) — Closed
- [#4 Add logo upload, placement, and scaling controls](https://github.com/jacobrosenfeld/placecard-generator/issues/4) — Closed
- [#5 Add typography controls and text fitting](https://github.com/jacobrosenfeld/placecard-generator/issues/5) — Closed
- [#6 Prepare Vercel deployment and production readiness](https://github.com/jacobrosenfeld/placecard-generator/issues/6) — Open
- [#7 Generate flat print-ready PDFs with correct fold geometry](https://github.com/jacobrosenfeld/placecard-generator/issues/7) — Closed
- [#8 Build the 3D folded preview and proof mode](https://github.com/jacobrosenfeld/placecard-generator/issues/8) — Closed
- [#9 Add test coverage for geometry, parsing, and export behavior](https://github.com/jacobrosenfeld/placecard-generator/issues/9) — Closed
- [#10 Add validation, normalization, and warning rules](https://github.com/jacobrosenfeld/placecard-generator/issues/10) — Closed
- [#11 Add a curated font chooser with Google Fonts override](https://github.com/jacobrosenfeld/placecard-generator/issues/11) — Closed (implemented as bundled curated fonts)
- [#12 Show app version in the site footer](https://github.com/jacobrosenfeld/placecard-generator/issues/12) — Closed
- [#13 Add simple password protection from config](https://github.com/jacobrosenfeld/placecard-generator/issues/13) — Open
- [#14 Add small caps option for names and tables](https://github.com/jacobrosenfeld/placecard-generator/issues/14) — Closed
- [#15 Add GitHub repo link to footer](https://github.com/jacobrosenfeld/placecard-generator/issues/15) — Closed
- [#16 Add CMYK color options](https://github.com/jacobrosenfeld/placecard-generator/issues/16) — Closed
- [#17 Generate PDFs using CMYK output](https://github.com/jacobrosenfeld/placecard-generator/issues/17) — Closed
- [#18 Include font name, CMYK values, and font size in Proof PDF (metadata)](https://github.com/jacobrosenfeld/placecard-generator/issues/18) — Closed
- [#19 Timestamp exported PDF filenames (proof & print-ready) using user's local date/time](https://github.com/jacobrosenfeld/placecard-generator/issues/19) — Closed
- [#20 Add export option: sort PDFs by table number or guest last name (with name parsing)](https://github.com/jacobrosenfeld/placecard-generator/issues/20) — Closed

If you'd like any of the remaining open issues closed or need follow-ups, tell me which ones and I'll either close them or ask for clarification.

## Contributing

See the issues above to pick work. If you'd like I can group issues into milestones, add labels, or assign priorities.
