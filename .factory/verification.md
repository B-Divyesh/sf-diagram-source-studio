# Independent product verification — FAIL

Verified on 2026-08-28 against candidate commit `a6e0064e078e76189b4ee873e6eb444efe33a85c` and `https://diagram-source-studio.sociobot.in`.

## Verdict

**FAIL — do not release this candidate.** The basic editor, documented claim tests, production build, accessibility scans, offline reload, response policies, and direct release assets work. Release-blocking failures remain in paid unlock enforcement, live checkout, demo isolation, byte-preserving source round trips, SPA event cleanup, and installer distribution.

## First-read test

Cold page, fresh browser context, 1440 × 900:

- What it does: “Catch broken diagram renders before commit.”
- Who it is for: engineers who keep Mermaid or D2 files in Git.
- What to click first: “Try it with sample data.” It opens the populated Mermaid workbench in one click.

This mandatory gate passes at 1440 × 900 and 390 × 844. At the common 1366 × 768 desktop viewport, however, the primary action starts at y=840 and is entirely below the 768px viewport; the caption and all three facts are also below the fold. That responsive defect is listed below.

## Release-blocking findings

### Critical

1. **Any unverified token unlocks Studio when verification is unavailable.** In a fresh context containing only `sb_license:diagram-source-studio=any-unverified-token`, with the verify request aborted as offline, `/demo` displayed “Studio license active” and “Compare versions” produced two `.matrix-result` panels. There was no cached valid verdict. This bypasses the paid renderer matrix.

### High

1. **The live purchase action is broken.** `GET https://api.sociobot.in/api/v1/products/diagram-source-studio/checkout` returns HTTP 404 with `{"error":"enabled factory product","status":404}`. “Buy Studio” therefore cannot complete the advertised $39 purchase.
2. **Demo mode writes real license data despite its promise.** From a fresh `/demo`, entering `qa-demo-license` and selecting “Verify license” wrote both `sb_license:diagram-source-studio` and `sb_license_verdict:diagram-source-studio` to normal local storage while the persistent banner said “Demo — sample data, nothing is saved.” This contradicts the `demo-sandbox` claim; the claim test checks only the real document key and misses the license keys.
3. **CRLF source is not preserved byte for byte.** Uploading `flowchart LR\r\n  A --> B\r\n` (25 characters), exporting SVG, and decoding its source metadata restored LF-only text (23 characters). This violates the researched success measure and the source-control-friendly editable-export promise for ordinary Windows files.
4. **SPA remounts duplicate action handlers.** In one document, open Demo, select “Start for real,” return through the “Demo” link, then select “Export SVG” once. Two `diagram.svg` downloads occur. `mountEditor()` adds document-level listeners on every route entry and never removes them.
5. **Every URL in the published `latest.json` is dead.** All five entries (macOS arm64, macOS x64, Windows, AppImage, deb) return HTTP 404. The manifest uses `Diagram%20Source%20Studio...` while GitHub published dot-normalized asset names such as `Diagram.Source.Studio...`.
6. **The Linux one-line installer fails before download.** `env XDG_BIN_HOME=/tmp/dss-install-bin sh public/install.sh` exits 1 with “Linux downloads are still being published.” Its text parsing expects minified GitHub JSON without spaces. The deployed script is byte-identical to the candidate. Even past that point, its whitespace-based checksum lookup cannot match filenames containing spaces. Static review finds the PowerShell checksum lookup has the same space-versus-dot filename mismatch.
7. **The downloadable desktop release is not built from the candidate.** Candidate `a6e0064` is `origin/main`, but annotated tag `v0.1.3` peels to commit `7a599d2`. The candidate changes the release workflow after that tag. Runtime product files are unchanged, but the candidate release workflow itself has not produced the published desktop artifacts.
8. **Claim-like promises are not comprehensively listed/tested.** `.factory/claims.json` omits observable README/site promises including native open/save dialogs, offline syntax reference, SVG removal of scripts/links/external references, no telemetry/runtime CDN, and unsigned desktop builds. The claims contract says unlisted claims fail review.

## Other findings

### Medium

- At 1366 × 768, the primary sample action is below the first viewport (top 840px), so a common laptop first screen does not show what to click.
- Several 390px touch targets are below 44px high: Demo/Privacy/footer links (26px), “Reset demo” (28px), “Start for real” (21px), and the app wordmark (32px).
- Hashed JS/CSS/font/image assets are served with `Cache-Control: public, must-revalidate, max-age=30`, not long-lived immutable caching.
- The brief calls for a D2 editor, but this candidate supports only a declared compact node/label/arrow subset; valid broader D2 syntax is rejected.

### Low

- The landing “Already bought it?” link targets nonexistent `#restore`. The Download header link targets nonexistent `#downloads` on `/privacy`, `/terms`, and the 404 screen.
- `/demo`, `/privacy`, and `/terms` keep the home canonical URL and home Open Graph title rather than route-specific metadata.
- Unknown routes render the designed 404 screen but return HTTP 200.
- `.factory/demo.md` says Mermaid 11.12 although the app, dependency, README, and claim use 11.17.2.

## Claims gate

The required file exists with six entries. Running each exact command before dependency installation produced the expected clean-clone setup error (`@playwright/test` absent). After the repository-declared `npm ci`, every exact claim command passed:

| Claim | Exact result |
| --- | --- |
| `demo-sandbox` | 1 passed (7.2s) |
| `private-local` | 1 passed (6.2s) |
| `editable-export` | 1 passed (7.7s) |
| `renderer-matrix` | 1 passed (7.7s) |
| `d2-preview` | 1 passed (6.2s) |
| `offline-core` | 1 passed (9.6s) |

The manual demo-storage and CRLF probes above show that two broad claims are under-tested despite the tagged cases passing.

## Repository gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 186 packages installed, 0 vulnerabilities |
| `npm test` | PASS; 12/12 Playwright tests |
| `npm run build` | PASS; exact production output in `dist/site/` |
| TypeScript | PASS through `tsc --noEmit` in the production build |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilities |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo check --locked --manifest-path src-tauri/Cargo.toml` | PASS after installing the Linux packages declared by the release workflow |
| `cargo test --locked --manifest-path src-tauri/Cargo.toml` | PASS; 0 Rust tests exist |
| `cargo clippy --locked --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` | PASS |
| Production preview `/demo` | PASS; rendered with no console/page errors |

The first Rust invocations stopped before candidate compilation because the clean worker lacked `glib-2.0`. Installing the workflow's declared `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, and `patchelf` prerequisites allowed all Rust gates to pass.

## End-to-end behavior

Passed fresh live checks:

- Populated Mermaid sample renders from `/demo`; reset restores it.
- Empty Mermaid source explains how to recover.
- Invalid Mermaid source reports a parse error and “Load working sample” recovers.
- Invalid compact D2 reports “No D2 nodes found”; Unicode D2 labels/arrows render and count UTF-8 bytes.
- Free mode blocks the version matrix while both SVG and PNG export paths work.
- A Mermaid `click` link was removed: no preview anchor, dangerous attribute, script, or outbound request remained.
- Direct Linux `.deb` download matches `SHA256SUMS` (`0bde927e...58ec`) and contains the 0.1.3 binary. The extracted binary stayed running for a 15-second Xvfb smoke test; only headless EGL acceleration warnings appeared.

Failed cases are the blockers above: CRLF round trip, demo license isolation, remount duplication, unavailable checkout, unverified-token unlock, `latest.json`, and install script.

## Accessibility and responsive QA

- Live axe scans on `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page`, at 1440 × 900 and 390 × 844: **0 total violations**, including 0 serious/critical.
- Each route has `lang=en`, a route title, one `h1`, and one `main`; meaningful raster art has alt text.
- Keyboard focus is visible with a computed 3px cyan outline. The mobile Source/Preview tabs respond to Left/Right arrows and update `aria-selected`.
- No keyboard trap or console/page error was observed.
- Reduced-motion emulation reduced animations/transitions to 0.01ms and one iteration.
- 390px pages had no horizontal overflow. Touch targets still fail as listed above.

## Privacy, network, and response policy

- Editing/exporting the sample sent no diagram contents off origin. The landing page makes the disclosed GitHub release-metadata request; license verification sends only the entered token to `api.sociobot.in`.
- The live document sends CSP, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, camera/microphone/geolocation denial, and `frame-ancestors 'none'`.
- License API CORS permits the deployed origin. Verify responses are `Cache-Control: no-store`.
- Controlled verify burst: 150 concurrent invalid-token requests yielded 30 HTTP 200 and 120 HTTP 429 responses. Every 429 had `Retry-After: 4`. Rate limiting therefore passes with an observed allowance of 30 in this burst.
- No sign-in exists, so Entra authority checks are not applicable. There is no product backend beyond release metadata and Sociobot billing. AI is an explicit non-goal and no missed AI leverage is evident.

## Service worker and performance

- Live service-worker update check found active/controller `/sw.js`, cache `diagram-source-studio-v0.1.3`, no waiting worker, and no update error.
- After going offline, `/demo` reloaded with HTTP 200 from the service worker and rendered a newly entered D2 diagram with no failed request.
- Production sizes: initial JS 31.08KB raw / 11.43KB gzip; CSS 16.46KB raw / 4.67KB gzip; fonts 79.55KB; mobile hero 24.9KB. Mermaid 10/11 bundles are lazy and absent from the landing first load.
- Independent Lighthouse 12.8.2 mobile: Performance 98, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0s, LCP 1.0s, CLS 0.008, TBT 150ms, total 123KiB.

## Deployment identity

Candidate-built `index.html`, `sw.js`, main JS, CSS, Mermaid 10 bundle, Mermaid 11 bundle, and hero art are byte-for-byte identical to the live URL. The live web deployment therefore matches the candidate's product files. The published desktop assets come from the earlier `v0.1.3` commit as described above; the product-source diff from that commit is empty, but the candidate workflow change is not represented by a release.

## Required next steps

1. Require a cached successful verdict before offline optimistic unlock; reject unverified tokens.
2. Register/enable the Sociobot billing product and verify checkout end to end.
3. Isolate all demo storage, including licenses, and expand the claim test accordingly.
4. Preserve line endings/bytes or narrow the promise honestly and test CRLF/BOM cases.
5. scope/remove editor event listeners on route unmount.
6. Publish candidate-built desktop assets; make `latest.json`, shell, and PowerShell installer filenames match GitHub's actual names and test every URL.
7. list and test every remaining public claim, then rerun this independent verification.
