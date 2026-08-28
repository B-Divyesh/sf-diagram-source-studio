# Diagram Source Studio handoff

## What was built

- A Tauri 2 desktop shell with native open/save dialogs for Mermaid, D2, SVG, and PNG files.
- A split source and rendered-output workbench with keyboard-friendly mobile pane tabs.
- Self-hosted Mermaid 10.9.8 and 11.17.2 renderers with a paid side-by-side matrix.
- A compact local D2 renderer covering nodes, labels, arrows, and edge labels.
- Diagnostics, explicit empty/error states, and a bundled offline syntax reference.
- SVG and PNG exports that embed UTF-8 source metadata. Both formats reopen byte for byte.
- Strict SVG cleanup before preview: scripts, links, foreign objects, event handlers, and external references are removed.
- A one-click `/demo` sandbox with in-memory sample state, reset, and exit controls.
- One-time $39 Studio checkout, callback capture, daily verification cache, offline optimistic state, and license restore.
- A night-market neon landing site with original generated artwork, responsive layouts, legal routes, 404, release downloads, security headers, and a service worker.
- A four-target GitHub Actions release workflow for Linux, Windows, macOS arm64, and macOS x64. It creates `SHA256SUMS` and `latest.json`.

## Run and verify

```sh
npm ci
npm test
npm run build:site
cargo check --manifest-path src-tauri/Cargo.toml
```

Static output is exactly `dist/site`; `index.html` is at that root. `npm run tauri dev` runs the desktop shell after the platform's Tauri prerequisites are installed.

Verification completed on 2026-08-28:

- `npm test`: 12 passed. This includes all six claim tests, five route accessibility scans, and a 390 px keyboard-pane test.
- `npm run build:site`: passed with 31.08 KB initial JS, 16.46 KB CSS, and 79.55 KB self-hosted WOFF2 fonts.
- `cargo check --manifest-path src-tauri/Cargo.toml`: passed.
- `cargo fmt --check`: passed.
- `npm audit`: zero vulnerabilities.
- `git diff --check`: passed before handoff.
- Lighthouse mobile, local production build: Performance 94, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse lab details: FCP 1.1 s, LCP 1.7 s, CLS 0, TBT 270 ms, Speed Index 1.1 s.
- Hero WebP: 79 KB desktop and 25 KB mobile. Social preview: 66 KB.

Claim details and exact commands are in `.factory/claims.json`. Demo isolation is documented in `.factory/demo.md`. Copy review is in `.factory/copy-audit.md`.

## Known gaps

- The compact D2 renderer is not the full upstream D2 engine. It supports the common node-and-arrow subset and labels this limit in the app and README.
- The browser and desktop editor accept UTF-8 text. Other source encodings are not converted.
- GitHub Release assets do not exist until the `v0.1.2` workflow completes. The landing page shows a calm release-page fallback meanwhile.
- The first `v0.1.0` workflow stopped on a Tauri 2.8/2.11 package mismatch. Version 0.1.1 aligns both sides on Tauri 2.11.
- The `v0.1.1` macOS x64 job used GitHub's retired `macos-13` label. Version 0.1.2 uses `macos-latest` with an explicit x86_64 target.
- The generated workflow is the source of truth for multi-platform packages; only the Linux Rust shell was compiled in this worker.

## Needs operator action

- Register `diagram-source-studio` in the Sociobot billing service with a $39 one-time price and the production return URL.
- Add Apple signing/notarization secrets when available: `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, and `APPLE_TEAM_ID`.
- Add Windows signing secrets when available: `WINDOWS_CERT_PFX` and `WINDOWS_CERT_PASSWORD`.
- Until those secrets exist, releases are intentionally unsigned and the landing page says so.

## Next steps

- Replace the compact D2 path with a sandboxed upstream D2 WASM build when a stable, license-compatible browser artifact is available.
- Add more deliberately divergent Mermaid fixtures as renderer releases change.
- Consider signed automatic updates only after signing and update-hosting operations exist.
