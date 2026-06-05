# Placecard Generator

Browser-first Next.js app for generating folded tent-card placecard proofs and
imposed duplex-ready print PDFs.

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
