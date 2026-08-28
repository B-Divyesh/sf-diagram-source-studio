# Diagram Source Studio repair handoff

## Status

Release repair `v0.1.4` addresses the independent verifier findings from commit `06768e7c6f85081107e674e17999dd2dbe8e23cd`. The static site is deployed at <https://diagram-source-studio.sociobot.in>.

The production billing catalog still does not list `diagram-source-studio`; its checkout returns HTTP 404. Repository policy forbids changing billing infrastructure here. The product now checks the live Sociobot catalog and does not show a dead purchase action while registration is unavailable. The free editor and existing-license restore remain usable.

## Repairs

- A token unlocks Studio only after a successful cached verdict for that same token. Offline verification never accepts a new or mismatched token.
- Demo source and license state use memory only. Demo license actions do not write `real:*` or `sb_license:*` local-storage keys.
- UTF-8 BOM and CRLF policy survive source open, local persistence, SVG metadata, PNG metadata, export, and reopen.
- Editor listeners have an explicit route teardown. Re-entering `/demo` no longer duplicates export or other actions.
- Release assets are normalized to their final dot-separated GitHub names before checksums and `latest.json` are generated. The manifest fails if any required platform is missing.
- The POSIX installer parses formatted GitHub JSON and verifies full filenames safely. PowerShell requires an exact filename checksum line.
- Public claims now have one tagged regression each, including license enforcement, native file controls, offline references, SVG cleanup, no tracking/CDN, unsigned builds, release installers, and Studio pricing.
- The 1366×768 first screen keeps its sample action and facts visible. Mobile navigation, footer, wordmark, and demo controls meet 44 px target height.
- Canonical and social metadata now follow SPA routes. Cross-route download and restore links resolve.
- Versioned assets use immutable one-year caching. Navigations use network-first service-worker updates with offline fallback.
- The live purchase link appears only when the catalog contains the exact USD 3900 product. Until then, the page clearly says purchases are temporarily unavailable.

## Verification evidence

Run from a clean checkout:

```sh
npm ci
npm test
npm run build
npm audit --audit-level=high
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
cargo clippy --locked --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Observed on 2026-08-28:

- `npm ci`: 186 packages, 0 vulnerabilities.
- `npm test`: 25 passed. This includes exact CRLF+BOM SVG/PNG round trips, demo license isolation, offline token rejection, SPA remount, release-manifest, installer, 1366×768, 390 px, keyboard, and route metadata regressions.
- Every command in `.factory/claims.json`: 1 matching test passed independently.
- `npm run build`: passed with TypeScript `--noEmit`; output is `dist/site`.
- Initial application JS: 34.08 KB raw / 12.44 KB gzip. CSS: 17.01 KB raw / 4.79 KB gzip. Fonts: 79.55 KB total. Mobile hero: 24.9 KB.
- npm audit: 0 vulnerabilities. Rust fmt, check, test, and clippy with warnings denied: passed.
- Production-preview `verify-url.sh` on `/` and `/demo`: HTTP 200, no console errors, title/lang/main/alt checks passed.
- Live `verify-url.sh` on `/` and `/demo`: HTTP 200, no console errors, title/lang/main/alt checks passed.
- Live axe integration on `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page` at 1440×900 and 390×844: 0 serious/critical findings, no console errors, and no horizontal overflow.
- Live keyboard checks: pane tabs support Left/Right; all tested interactive controls remain reachable with visible 3 px focus.
- Live service worker: controller `/sw.js`, cache `diagram-source-studio-v0.1.4`, no waiting worker; offline `/demo` reload and D2 render passed.
- Live response policy: CSP, HSTS, nosniff, strict-origin referrer policy, and camera/microphone/geolocation denial present. Hashed assets return `Cache-Control: public, max-age=31536000, immutable`.
- Live identity: deployed main JS SHA256 `99b969d450fa41e4bac79c443a4466755ba507137e67c78cd6472b8f035d9856` matches `dist/site` byte for byte.
- Live Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.6 s, CLS 0, TBT 30 ms.
- Release workflow: tag `v0.1.4` builds Linux AppImage/deb, Windows MSI/EXE, and macOS arm64/x64 DMGs from this repair commit, then publishes `SHA256SUMS` and `latest.json`.

## Known limits

- D2 support remains the deliberately labeled compact nodes/labels/arrows subset. Full upstream D2 WASM is about 22 MB compressed at source and would materially change the offline package; this repair preserves the already-passing scoped renderer.
- The application accepts UTF-8 source. It preserves UTF-8 BOM and LF/CRLF but does not transcode legacy encodings.
- Unknown SPA paths display the designed 404 view but Azure Static Web Apps returns the navigation fallback with HTTP 200.

## Needs operator action

- Enable `diagram-source-studio` in the Sociobot billing catalog at $39 USD with return URL `https://diagram-source-studio.sociobot.in/`. The UI will expose checkout automatically after the live catalog contains that exact product.
- Add Apple secrets `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, and `APPLE_TEAM_ID` to sign/notarize macOS releases.
- Add `WINDOWS_CERT_PFX` and `WINDOWS_CERT_PASSWORD` to sign Windows releases. Until then, builds remain explicitly unsigned.
