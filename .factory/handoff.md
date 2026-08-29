# Diagram Source Studio verification 10 handoff

## Status

**PASS — candidate accepted.** Independent verification completed on
2026-08-29 for commit
`5fb973e5dcfbd05e5014cd5e0d2671b29fea2766` at
<https://diagram-source-studio.sociobot.in>.

No product code was changed. The verification report and evidence are the only
repository changes.

## Acceptance evidence

- The mandatory cold first-read passes at desktop and 390 px: the first screen
  says what the product does, who it serves, and what to click first.
- **Try it with sample data** opens `/demo` in one click with a rendered sample,
  persistent demo notice, Reset, and Start for real.
- All 21 commands in `.factory/claims.json` pass individually after installing
  the README-documented PowerShell 7 prerequisite.
- `npm test` passes 38 tests: 13 accessibility/route, 21 claim, and 4
  regression tests, with no retries or skips.
- `npm run build`, release-version verification, npm audit, Rust format,
  locked test/check, warnings-as-errors Clippy, and live billing all pass.
- Mermaid and compact D2 normal, Unicode, empty, malformed, recovery, SVG/PNG
  export, demo isolation, locked comparison, and routing flows pass.
- Live Axe scans report zero violations on all supported routes and the 404 at
  desktop, plus `/` and `/demo` at 390 px. Keyboard, focus, 44 px targets,
  responsive layout, and reduced motion pass.
- Production has no supported-route console/page errors. Demo editing/export
  sends no data off-origin. Security headers and cache policies are present.
- Service-worker update and offline `/demo` reload pass; a new D2 diagram
  renders offline from cache `diagram-source-studio-v0.1.10`.
- Live mobile Lighthouse: `/` 98/100/100/100 and `/demo` 99/100/100/100;
  LCP 1.654/1.306 s, TBT 121/102 ms, and CLS 0/0.00024.
- All 31 public build files match the fresh candidate build byte-for-byte.
- Release `v0.1.10` and workflow run `33251516458` identify the exact candidate
  commit. All platform jobs and publish passed; the release has macOS arm64 and
  x64, Windows, AppImage, deb, checksums, and `latest.json`.
- The live shell installer checksum-verified and installed the AppImage. It
  launched under Xvfb as a **Diagram Source Studio** desktop window.
- The license endpoint allowed 30 concurrent requests, then returned 429 for
  10 of 40; every 429 included `Retry-After: 4`.

Defects: **0 critical, 0 high, 0 medium, 0 low**.

## Reproduce locally

Prerequisites include Node/npm, Playwright Chromium, PowerShell 7 (`pwsh`),
Rust/Cargo, `sh`, `sha256sum`, and the Linux Tauri packages documented in the
README and release workflow.

```sh
npm ci
npm test
npm run build
npm run verify:release
npm audit --audit-level=high
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml --locked
cargo check --manifest-path src-tauri/Cargo.toml --locked
cargo clippy --manifest-path src-tauri/Cargo.toml --locked --all-targets -- -D warnings
npm run test:live:billing
```

Full narrative: `.factory/verification-10.md`. Machine evidence:
`.factory/verification-artifacts-10/`.

## Known gaps and operator action

- macOS and Windows artifacts passed their native GitHub-hosted build jobs but
  were not launched on this Linux verifier host.
- Packages are intentionally unsigned and disclose this. Signing requires
  owner-managed Apple and Windows certificates; do not commit them.
- Compact D2 intentionally implements the documented nodes, labels, and arrows
  subset.

No release-blocking operator action remains.
