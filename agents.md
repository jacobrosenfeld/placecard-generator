# Agents.md

## Purpose

This repository is a browser-first Next.js app for generating folded tent-card placecard proofs and print-ready PDFs. Follow the existing app conventions and keep changes minimal, correct, and aligned with the shared geometry/layout model.

## Product Rules

- Preserve the folded tent-card workflow: finished folded size is the input, and the generated PDF represents the flat unfolded card.
- Keep tent-card geometry and orientation correct across previews and PDF output.
- Reuse shared layout logic instead of duplicating calculations for PDF, 2D preview, and 3D preview.
- Prefer client-side processing where practical.
- Avoid introducing persistent storage, a database, auth, queues, or other backend complexity unless explicitly requested.
- Keep uploaded guest lists, logos, and generated PDFs ephemeral unless a future save-project feature requires otherwise.

## Development Expectations

- Use Next.js App Router, React, TypeScript, and Tailwind CSS where you are extending the app.
- Keep changes focused and consistent with the existing code style.
- Add or update tests when behavior, parsing, geometry, or export logic changes.
- Use `npm run test` and `npm run build` to validate meaningful changes when applicable.

## Version & Changelog Rules

- Bump the project version once per release-intent change set, such as a new PR or release candidate.
- Use semantic versioning:
  - Patch (`x.y.z`) for fixes and UI updates.
  - Minor (`x.y.0`) for new features.
  - Major (`x.0.0`) for breaking changes.
- Do not bump the version or changelog for agent-instruction-only updates, such as `AGENTS.md`, `CLAUDE.md`, or similar AI context files.
- Do not bump the version or changelog for non-runtime tooling-only adjustments.

## Repo References

- Project overview and workflow details: `README.md`
- Existing agent-oriented guidance: `placecard-generator-agent-instructions.md`
- Licensing and third-party notices: `LICENSE` and `THIRD_PARTY_NOTICES.md`

## Adding & Bundling Fonts

When we add curated/bundled fonts to the app, follow these steps so future agents can quickly roll out new font families consistently and safely.

- Files & location:
  - Add font files (TTF/OTF) to `public/fonts/`.
  - Include the font license and attribution in `public/fonts/` (e.g., `OFL.txt`), and ensure any bundled fonts comply with licensing.

- Code changes (single place):
  - Edit `src/lib/typography.ts` and add a `CuratedFont` entry to the `CURATED_FONTS` array. Provide:
    - `id`: short slug (used in settings and internal calls).
    - `label`: human-friendly name shown in the UI.
    - `cssFamily`: CSS font-family string to use in previews and pages.
    - `weights`: list of supported weights (`light|normal|bold`).
    - `fontFileUrls`: map each weight to the corresponding `/fonts/` file path.
    - `syntheticBold` (optional): set to `true` when the font lacks a bold face and the UI should synthesize it.
  - Example entry is already present in `src/lib/typography.ts`; copy that shape.

- PDF embedding:
  - `src/lib/pdfTextRenderer.ts` calls `fetchCuratedFontBytes()` from `src/lib/typography.ts` and fetches the font bytes by the `fontFileUrls` path. Use TTF/OTF files for best compatibility.
  - No additional server changes are required if the font files are reachable under `/fonts/...`.

- UI & tests:
  - `src/components/TypographyControls.tsx` reads `CURATED_FONTS` to populate the font picker — adding the entry will expose the font in the UI automatically.
  - Add or update tests in `test/typography.test.ts` to cover any helper behavior (e.g., `normalizeFontWeight`, `availableFontWeights`).

- PR checklist for adding a font:
  1. Add font files to `public/fonts/` and commit the license text.
  2. Add a `CURATED_FONTS` entry in `src/lib/typography.ts` using the existing entries as examples.
  3. Run `npm run test` and verify `test/typography.test.ts` passes.
  4. Launch the dev server and verify the new font appears in the font picker and renders correctly in both previews.
  5. Generate a Proof PDF and verify the font is embedded and renders correctly in the exported file.
  6. Include a short note in the PR description about the font source and license (link to font project/author).

If you need to support web-hosted fonts (Google Fonts) instead of bundling files, add a short note in the PR and ensure PDF embedding falls back to a bundled font for exports.

