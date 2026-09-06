# Check diagram renders before commit — review 4

- Reviewed: 2026-09-06
- Live URL: https://diagram-source-studio.sociobot.in
- Implementation reviewed: `80d2b686ec61efd15441e3faa0075a2f205abea2`
- Release documentation commit: `5fb973e5ff45381bd5a8d21b1e2cbc35649157d0`
- Review documentation base: `966f0c51a401072304e292741f598fc8d4e6f90f`

## Verdict: FAIL

- Finding count: **1**
- Untested public claim count: **2**

The web product, demo, offline path, exports, accessibility, legal routes, and release files passed. The installed Linux desktop app cannot finish its purchase check because the public billing API does not allow the Tauri app origin. This blocks purchase and license verification in the shipped artifact.

## Finding

### F-4-1 — High — The installed app cannot purchase or verify a Studio license

In a clean consumer environment, the verified v0.1.10 Linux AppImage opened and the free editor rendered the sample. The purchase panel stayed at “Checking purchase availability…” after 30 seconds.

The native UI sends its catalog and license requests directly from the Tauri webview. The API responded with HTTP 200 but did not return an `Access-Control-Allow-Origin` header for either installed-app origin:

| Request origin | API response | Browser access |
| --- | --- | --- |
| `http://tauri.localhost` | 200, no matching allow-origin header | Blocked |
| `tauri://localhost` | 200, no matching allow-origin header | Blocked |
| `https://diagram-source-studio.sociobot.in` | 200, matching allow-origin header | Allowed |

This prevents a clean installation from loading the product catalog or verifying a pasted license. The buy action never becomes ready, and the Studio comparison cannot unlock.

The declared `billing-catalog` and `studio-purchase` commands pass, but their browser tests intercept the API or exercise license state without using the installed Tauri origin. They do not prove the public claims in the shipped desktop app. Both claims therefore remain untested for the installed artifact.

Required repair: allow the product's Tauri origins at the public API or move these calls behind a narrow native command. Add an installed-origin integration test, publish a new desktop release, and repeat the clean-install purchase and verification check.

Evidence:

- `/work/.evidence/review-4-native.png` — installed AppImage with populated editor and preview.
- `/work/.evidence/review-4-native-30s.png` — purchase panel still waiting after 30 seconds.
- Direct catalog and verify probes with the three origins listed above.
- `src/license.ts` makes the affected catalog and verification requests from the webview.

## First screen

Before scrolling, fresh desktop and phone browsers stated:

- Job: “Catch broken diagram renders before commit.”
- Audience: engineers who keep Mermaid or D2 files in Git.
- First action: “Try it with sample data.”

The job, audience, action, and three short facts fit within the first screen at 1440×900, 1366×768, and 390×844.

## Demo and editor checks

- One click entered the sample at `?demo=1`; `/demo` also entered directly.
- The sample contained realistic Mermaid source, diagnostics, and populated SVG output.
- “Demo — sample data, nothing is saved” stayed visible with **Reset demo** and **Start for real**.
- A sentinel real-data key was unchanged after editing, reset, and exit. A clean demo created no local storage keys.
- Mermaid and D2 normal paths rendered. Empty, malformed, boundary, and recovery paths gave specific messages and recovered.
- SVG and PNG downloads contained rendered output; SVG included editable source metadata.
- Offline reload restored the editor and rendered D2 from the local renderer.

## Declared claim commands

Every exact command in `.factory/claims.json` was run from a clean checkout after installing the documented prerequisites. All commands exited successfully. Two claims are still counted as untested because their tests do not cover the installed-origin failure in F-4-1.

| Claim | Command result | Review result |
| --- | --- | --- |
| `demo-sandbox` | Pass | Proven |
| `private-local` | Pass | Proven |
| `editable-export` | Pass | Proven |
| `renderer-matrix` | Pass | Proven |
| `d2-preview` | Pass | Proven |
| `offline-core` | Pass | Proven |
| `license-enforcement` | Pass | Proven |
| `native-file-dialogs` | Pass | Proven |
| `offline-reference` | Pass | Proven |
| `safe-svg` | Pass | Proven |
| `no-tracking` | Pass | Proven |
| `unsigned-builds` | Pass | Proven |
| `release-installers` | Pass | Proven |
| `studio-purchase` | Pass | **Untested in installed artifact** |
| `billing-catalog` | Pass | **Untested in installed artifact** |
| `license-verdict-one-day` | Pass | Proven |
| `refund-revocation` | Pass | Proven |
| `no-sign-in` | Pass | Proven |
| `free-editor-diagnostics` | Pass | Proven |
| `startup-network` | Pass | Proven for the web origin |
| `checkout-provider` | Pass | Proven for the web origin |

Each claim ID appeared in exactly one tagged test. No unlisted public claim was found in the live site or README beyond the installed-artifact coverage defect above.

## Clean checkout and installed artifact

- `npm ci`: pass, 186 packages, 0 vulnerabilities.
- `npm test`: pass; 13 accessibility and route checks, 21 isolated claim commands, and 4 regression checks.
- `npm run build`: pass; produced `dist/site`.
- `npm run verify:release`: pass for v0.1.10.
- `npm audit`: pass, 0 vulnerabilities.
- `cargo fmt --all -- --check`: pass.
- `cargo test --manifest-path src-tauri/Cargo.toml`: pass.
- `cargo check --manifest-path src-tauri/Cargo.toml`: pass.
- `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings`: pass.

PowerShell and the documented Linux Tauri packages were absent from the base worker image. The first affected commands failed for those missing prerequisites. After installing the README prerequisites into the disposable environment, the exact commands above passed. The initial failures were setup failures, not concealed product results.

The v0.1.10 AppImage was downloaded into a clean consumer directory and matched `SHA256SUMS`:

- Size: 80,587,256 bytes.
- SHA-256: `f0639c91c526c9c7d5b4dfe8c99598971dda33eb4674bfb2905e9c99d30a1353`.
- It opened as a 1440×900 native window, loaded the sample, produced diagnostics, and rendered the preview.
- Its purchase path failed as described in F-4-1.

## Accessibility, routes, and links

- `/`, `/demo`, `/privacy`, and `/terms` returned 200 with route-specific titles, `lang`, one `h1`, `main`, and footer.
- Automated accessibility scans reported no violations on those routes.
- Keyboard order began with the skip link; Enter moved focus to main content.
- Tab and arrow-key operation worked, and focus used a visible 3 px cyan outline.
- All 17 visible phone controls measured at least 44×44 CSS pixels.
- At 200% equivalent reflow there was no horizontal overflow and the main action remained visible.
- Reduced motion reduced animation and transition duration to effectively zero.
- Back navigation restored the route and focused its heading.
- Internal, release, checkout, and legal links resolved.
- The unknown route returned a deliberate HTTP 404 with the designed page, title, heading, landmarks, and home link. The browser's expected 404 resource entry is not a defect.

## Privacy, offline, and performance

- A clean first load made only bodyless public GET requests to GitHub release metadata and the Sociobot product catalog.
- Demo editing made no external request and did not touch the real-data sentinel.
- No analytics, tracking, third-party fonts, or third-party scripts loaded.
- Security headers included CSP, HSTS, content-type protection, strict referrer policy, and denied camera, microphone, and geolocation permissions.
- The service worker updated, created `diagram-source-studio-v0.1.10`, and supported an offline reload.
- Built initial JavaScript was 35.90 KB raw and 12.99 KB gzip; CSS was 17.06 KB raw and 4.65 KB gzip; fonts totaled 79.55 KB.
- Lighthouse root: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.60 s, TBT 19 ms, CLS 0.
- Lighthouse demo: 100/100/100/100; LCP 1.39 s, TBT 23 ms, CLS 0.00024.

## Live release comparison

The live static files matched a fresh build from the reviewed checkout: 31 files compared, zero mismatches, and zero fetch failures. Commits after implementation `80d2b686...` changed only `.factory` documentation. Release v0.1.10 was built from documentation commit `5fb973e5...`, which contains the same product implementation. Later review-only commits do not require a new image.

The GitHub release contains macOS arm64 and x64 packages, Windows MSI and EXE packages, Linux AppImage and deb packages, `SHA256SUMS`, and `latest.json`. The release workflow completed successfully.

## Earlier findings

Every earlier finding, including minor items, was checked again.

| Earlier review finding | Current disposition |
| --- | --- |
| Review 1: missing header and footer | Fixed; consistent landmarks and footer are present. |
| Review 1: incomplete claim inventory | Earlier omissions are covered; F-4-1 exposes a new installed-origin gap. |
| Review 1: long README sentence | Fixed; copy audit passes. |
| Review 1: jargon headings | Fixed; headings use plain task words. |
| Review 2: incomplete platform package fit | Fixed; release contains the documented platform packages. |
| Review 2: release claim checked only source text | Fixed; release assets and checksums are exercised. |
| Review 2: inconsistent renderer terminology | Fixed. |
| Review 2: literal 404 path used route fallback | Fixed; unknown paths now return HTTP 404. |

| Earlier verification finding | Current disposition |
| --- | --- |
| License unlock accepted an unverified token | Fixed in code and claim tests; installed verification is now blocked by F-4-1. |
| Checkout/catalog was unavailable | Fixed for web; installed catalog access is blocked by F-4-1. |
| Demo wrote the real license namespace | Fixed; real-data sentinel stayed unchanged. |
| CRLF source was not preserved | Fixed; Rust byte-preservation test passed. |
| Duplicate handlers rendered twice | Fixed; regression test passed. |
| Latest download URLs were dead | Fixed; release assets resolve and checksum matches. |
| Installer command failed | Fixed; clean Linux install downloaded and launched the artifact. |
| Release predated the implementation | Fixed; v0.1.10 contains the reviewed implementation. |
| Missing claims and claim tests | Fixed for the listed earlier cases; F-4-1 identifies two newly incomplete installed-artifact claims. |
| 1366 px first action fell below the fold | Fixed; first screen fits at 1366×768. |
| Touch targets were too small | Fixed; phone targets measured at least 44×44. |
| Runtime cache used unversioned URLs | Fixed; versioned service-worker cache works offline. |
| D2 support was described too broadly | Fixed by clear supported-subset disclosure. |
| Dead landing-page anchors | Fixed; link crawl passed. |
| Route metadata was wrong | Fixed; titles and metadata are route-specific. |
| Unknown paths returned 200 | Fixed; deliberate designed 404 returned. |
| Demo docs named the wrong Mermaid version | Fixed. |
| Checkout product registration was missing | Fixed; live web checkout reaches Dodo. |
| Successful checkout did not issue a license | Later verification proved issuance and return; no new paid production purchase was made. Installed verification remains blocked by F-4-1. |
| Full test suite crashed around offline context | Fixed; isolated claim commands and full suite pass. |
| Native file claim only checked presence | Fixed; native IPC and byte-preservation behavior are tested. |
| Daily verdict cache and refund revocation lacked coverage | Fixed; both claims pass. |
| Demo performance failed | Fixed; demo Lighthouse performance is 100. |
| Skip link was not first focus | Fixed. |
| Release metadata was stale | Fixed; v0.1.10 metadata and assets agree. |
| README omitted PowerShell prerequisite | Fixed; the documented setup was sufficient after installation. |
| Reviews 7, 8, and 10 reported no defects | Rechecked; their passing areas remain passing except the new installed-origin defect. |

## Scope notes

This is a static site and Tauri desktop product. It has no product-owned backend, tenant data store, server health route, or restart-persistence claim. Backend tenant isolation, SQLite restart persistence, and product rate-limit behavior are therefore not applicable. Only public GET checks were made against shared billing services; no shared data, secrets, staging systems, or other products were accessed.

No product code was modified during this review.
