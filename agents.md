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
