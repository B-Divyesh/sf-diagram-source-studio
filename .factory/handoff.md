# Diagram Source Studio repair 8 handoff

## Status

**PASS.** Repair 8 is complete on 2026-09-06.

- Final implementation and release commit: `f2a906680d470b70ca1558e59dcf62f82955d645`
- Final release: [`v0.1.13`](https://github.com/B-Divyesh/sf-diagram-source-studio/releases/tag/v0.1.13)
- Release workflow: [34011343508](https://github.com/B-Divyesh/sf-diagram-source-studio/actions/runs/34011343508), all jobs successful
- Static deployment: `126d1e93-95bc-465b-a86b-8d32903598e9`
- Live site: <https://diagram-source-studio.sociobot.in>

The job is to catch Mermaid and D2 render differences before a commit, for engineers who keep those files in Git. A cold visitor's first action is **Try it with sample data**.

## Repair

Review 4's high-severity defect is resolved at its cause. The installed Tauri webview no longer relies on browser CORS for billing. A narrow Rust `billing_request` command now permits only the public product catalog and this product's license-verification endpoint, and returns their status/body to the desktop UI. It accepts neither arbitrary URLs nor a catalog token. No diagram source is sent.

The desktop claims now exercise the native IPC path, and a Rust outcome test makes real HTTP requests to a local fixture for both permitted operations and rejected inputs.

Consumer testing uncovered one additional state defect: a successful catalog result was replaced by a permanent “Checking purchase availability…” label after an invalid license check. `checkoutAvailability` now persists the resolved state across license-panel rerenders. The new `@regression:catalog-ready` test proves that an invalid native verification leaves the live buy link in place.

`v0.1.12` was superseded by this final state repair; use only `v0.1.13`.

## Verification

From the documented setup, local checks passed:

```sh
npm test
npm run build
npm run verify:release
npm audit --audit-level=high
npm run test:live:billing
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo clippy --locked --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

`npm test` passed 13 route/accessibility checks, all 21 independently executed declared claims, and five regressions. The release workflow repeated `npm ci`, the full browser suite, production build, audit, live billing check, and four platform builds from a clean GitHub checkout.

The final public catalog confirmed the exact USD 3,900 offer and its checkout returned HTTP 303 to Dodo Payments, whose hosted page returned 200. `/work/.evidence/billing-offer.json` records the public offer metadata. `.factory/catalog-description.txt` is the verb-first 55-byte description and is copied to `/work/.evidence/catalog-description.txt`.

### Final live checks

- `verify-url.sh` passed live `/` and `/demo`: route title, `lang`, one h1, main landmark, image alternatives, named controls, and no page-console errors.
- Fresh 1440×900 desktop and 390×844 phone contexts began at scroll position zero with the required job, audience, and first action. Each loaded the realistic 215-byte Mermaid sample, showed the persistent demo banner, rendered output, reset, and preserved a `REAL-DO-NOT-TOUCH` real-storage sentinel.
- Live Axe scans found zero serious or critical issues on `/`, `/demo`, `/privacy`, `/terms`, and the designed 404.
- The live service worker cache is `diagram-source-studio-v0.1.13`; a fresh demo reloaded and rendered an edit after the browser was switched offline.
- All 31 deployable static files matched the final `dist/site` byte-for-byte. Host-only `staticwebapp.config.json` was correctly excluded.
- Mobile Lighthouse: performance 98, accessibility 100, best practices 100, SEO 100; LCP 2.391 s, TBT 75 ms, CLS 0, transfer 184,990 B.

### Published desktop artifact

The final AppImage was downloaded to a fresh temporary consumer directory, checked against `SHA256SUMS`, and its `latest.json` reported `v0.1.13` with implementation commit `f2a906680d470b70ca1558e59dcf62f82955d645` plus all five platform targets.

Under a fresh user-data directory and Xvfb, the checksum-verified AppImage opened its populated native editor and preview. It loaded **Buy Studio for $39 once**. Pasting the benign invalid token `not-a-valid-license` returned **This license is no longer active.** and retained that buy link. This proves both catalog availability and the invalid-license verification path in the installed artifact, closing Review 4's two previously untested claims. The only process log lines were expected headless EGL/DRI3 warnings from Xvfb, not app errors.

## Earlier findings

All prior findings listed in Reviews 1–4 and Verifications 1–10 were rechecked. Header/footer/landmarks, claim inventory, plain wording, platform packages, release-asset verification, renderer terminology, 404 status, unverified-token enforcement, demo isolation, CRLF/BOM preservation, duplicate-handler prevention, installer checksums, release provenance, first-screen fit, touch targets, versioned offline cache, compact-D2 disclosure, links, metadata, PowerShell setup, daily license caching, refund revocation, and skip-link order remain fixed.

The only open Review 4 item, F-4-1 (desktop billing CORS), is fixed and tested in the final installed artifact. The temporary catalog-state defect found while proving its invalid path is fixed by the final regression. No known functional defect remains.

This is a static site and desktop app, with no product backend, tenant store, SQLite mount, health endpoint, or product-owned rate limit. Backend isolation, restart persistence, and 429 checks are therefore not applicable. No shared services, secrets, staging systems, or other products were accessed.

## Known limits and operator action

- The macOS and Windows artifacts were built successfully by GitHub-hosted runners but were not launched from this Linux consumer host.
- Desktop artifacts are intentionally unsigned, and the download page says so. Before signed releases are advertised, the operator must add signing workflow configuration and provide `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`; the current workflow intentionally reads neither secret.
- Compact D2 supports the disclosed nodes, labels, and arrows subset, not the full D2 language.

## Documentation commit

This handoff is committed after the implementation. If its documentation SHA differs from the implementation SHA above, the deployed static site and `v0.1.13` desktop release still correspond to `f2a906680d470b70ca1558e59dcf62f82955d645`.
