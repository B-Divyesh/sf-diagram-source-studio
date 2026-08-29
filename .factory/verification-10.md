# Independent product verification 10 — PASS

Verified on 2026-08-29 from candidate commit
`5fb973e5dcfbd05e5014cd5e0d2671b29fea2766` against
<https://diagram-source-studio.sociobot.in>.

## Verdict

**PASS — accept this candidate.** The production web deployment and published
desktop release are builds of the exact candidate. The mandatory first-read,
one-click demo, all 21 declared claims, local quality gates, representative
editor/export flows, privacy checks, accessibility checks, offline reload,
performance budgets, billing rate limit, and Linux desktop smoke test passed.

Defect count: **0 critical, 0 high, 0 medium, 0 low**. No product code was
modified during this verification.

This supersedes verification 9. Its stale-release defect is closed by release
`v0.1.10`, whose manifest records the exact candidate commit. Its test-setup
defect is closed because the README now names PowerShell 7 and the other test
prerequisites.

## Mandatory first-read and demo gates

**PASS.** A cold live load at both 1440×900 and 390×844 answers the required
questions without scrolling:

- What it does: **“Catch broken diagram renders before commit.”**
- Who it is for: **“For engineers who keep Mermaid or D2 files in Git and need
  to inspect real output.”**
- What to do first: **“Try it with sample data.”** The adjacent sentence says
  it loads a Mermaid project in the browser.

The three facts—files stay on-device, core editing works offline, and the free
editor/one-time $39 Studio price—also fit the first mobile screen. The button
opens `/demo` in one click with a realistic Mermaid project already rendered.
The persistent banner says **“Demo — sample data, nothing is saved”** and
provides **Reset demo** and **Start for real**. Demo editing and reset did not
touch a real-workspace sentinel; reset restored the bundled source.

## Claims gate

`.factory/claims.json` exists and contains 21 entries. I invoked every listed
command individually before the broader suite. The clean worker initially
reported the repository prerequisite guard, `Missing test prerequisite: pwsh`,
before any claim assertion ran. I installed the README-documented PowerShell
7.5.3 prerequisite, then reran every exact command from the unchanged clone.
All 21 passed:

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `private-local` | PASS |
| `editable-export` | PASS |
| `renderer-matrix` | PASS |
| `d2-preview` | PASS |
| `offline-core` | PASS |
| `license-enforcement` | PASS |
| `native-file-dialogs` | PASS |
| `offline-reference` | PASS |
| `safe-svg` | PASS |
| `no-tracking` | PASS |
| `unsigned-builds` | PASS |
| `release-installers` | PASS |
| `studio-purchase` | PASS |
| `billing-catalog` | PASS |
| `license-verdict-one-day` | PASS |
| `refund-revocation` | PASS |
| `no-sign-in` | PASS |
| `free-editor-diagnostics` | PASS |
| `startup-network` | PASS |
| `checkout-provider` | PASS |

The guard was an unmet verifier-host prerequisite, not a failed product
assertion. The prerequisite and executable name are documented in README. The
post-setup exit code and timing of every command are recorded in
`verification-artifacts-10/claims/summary.tsv`; each command has its own log.
I cross-checked the landing page, legal pages, editor, and README with the
manifest and found no material unlisted claim.

## Clean install, tests, and build

Environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2, PowerShell 7.5.3,
Rust/Cargo 1.98.0, Linux x86_64.

| Check | Result |
| --- | --- |
| Candidate identity | PASS — initial `HEAD` was the requested commit |
| `npm ci` | PASS — 186 packages, 0 vulnerabilities |
| 21 exact claim commands | PASS individually |
| `npm test` | PASS — 13 accessibility/route, 21 claim, and 4 regression tests; no retries or skips |
| `npm run build` | PASS — TypeScript and exact Vite production build emitted `dist/site/` |
| Type check | PASS — `tsc --noEmit` is part of the production build |
| Lint | Not configured; Rust Clippy is configured and passed |
| `npm run verify:release` | PASS — synchronized version `0.1.10` |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml --locked` | PASS — native BOM/CRLF/Unicode byte round trip |
| `cargo check --manifest-path src-tauri/Cargo.toml --locked` | PASS |
| `cargo clippy --manifest-path src-tauri/Cargo.toml --locked --all-targets -- -D warnings` | PASS |
| `npm run test:live:billing` | PASS |

The Linux Tauri checks used the same WebKitGTK, AppIndicator, librsvg, and
patchelf system dependencies declared by the release workflow. Per the desktop
installer contract, platform packages were taken from GitHub Actions rather
than rebuilt in this worker.

## End-to-end product exercise

The smallest useful product works through its live demo:

- The bundled Mermaid project opens already rendered with diagnostics.
- Empty source reports **“The source is empty. Type a diagram or load the
  sample.”** Export is blocked with **“Fix the preview before exporting.”**
  **Load working sample** recovers immediately.
- Malformed Mermaid reports a renderer-specific parse error and recovers.
- Compact D2 rendered Unicode nodes **Café ☕** and **你好世界** with a labelled
  **naïve route** arrow. Input with no nodes reports **“No D2 nodes found. Add
  a node or an arrow.”** and then recovers.
- SVG (1,529 bytes) and PNG (43,929 bytes) downloads had the correct signatures
  and embedded Diagram Source Studio source metadata. The claim suite also
  proves byte-for-byte BOM/CRLF/Unicode round trips and adversarial SVG cleanup.
- With no verified license, comparison remains locked and no renderer matrix
  appears. Blank restore input gives a specific next step.
- **Start for real** removes demo state; browser Back restores `/demo` and
  focuses its h1. Reset does not write the real storage namespace.
- Privacy, Terms, and the designed unknown route have distinct titles, one h1,
  one main landmark, and correct HTTP results; the unknown route returns 404.

The researched scope is represented: split source/preview, diagnostics,
bundled references, two-version Mermaid comparison, editable exports, native
file-dialog coverage, and source-preserving native tests. Whiteboarding,
hosting, and AI generation remain correctly out of scope. No missed-leverage
feature is release-blocking.

## Privacy, network, and security headers

A cold landing load requested only same-origin static files plus these two
documented public-data GETs:

- `https://api.github.com/repos/B-Divyesh/sf-diagram-source-studio/releases?per_page=1`
- `https://api.sociobot.in/api/v1/products`

Both had no body and contained no diagram source. After `/demo` loaded,
editing, rendering, resetting, and export requested only a same-origin Mermaid
bundle and a browser blob URL. There was no analytics, telemetry, third-party
script, external font, or diagram-source upload.

Live document responses have CSP restrictions including `default-src 'self'`,
limited `connect-src`, `object-src 'none'`, and `frame-ancestors 'none'`; HSTS;
`nosniff`; strict-origin referrer policy; and denied camera, microphone, and
geolocation permissions. Documents and `sw.js` use 30-second revalidation.
Hashed assets and bundled renderers use one-year immutable caching.

The product has no sign-in, so the Entra authority check is not applicable.
It has no product backend, tenant persistence, or health endpoint; concurrency
and backend persistence checks are likewise not applicable. The external
Sociobot license-verification endpoint was checked separately under Rate limit.

## Accessibility, keyboard, mobile, and motion

- The factory `verify-url.sh` passed live `/` and `/demo`: title, `lang=en`,
  one h1, main landmark, image alternatives, named buttons, and zero errors.
- Axe WCAG 2 A/AA and 2.1 A/AA scans found **0 violations**, including zero
  serious/critical findings, on desktop `/`, `/demo`, `/privacy`, `/terms`,
  and the designed 404, plus 390 px `/` and `/demo`.
- Keyboard focus begins on **Skip to main content** with a visible 3 px cyan
  outline. Enter moves focus to `main`. ArrowRight changes the 390 px editor
  tab from Source to Preview and updates its selected state.
- At 390×844 there is no horizontal overflow and no visible interactive target
  under 44×44 CSS pixels. The headline, audience, action, explanation, and
  three facts fit the first viewport.
- With reduced motion, scroll behavior is `auto`; tested animation and
  transition durations reduce to 0.00001 seconds with one iteration.
- Supported routes produced no console or page errors. Chromium logs its
  expected failed-resource message only when deliberately navigating the HTTP
  404 document itself.

Every rendered destination was crawled. Internal pages, checkout, release,
download, and Sociobot destinations succeeded after redirects. Only the
deliberately unknown page returned 404.

## PWA, update, and offline behavior

**PASS.** The live `/sw.js` installed and controlled `/demo`.
`registration.update()` completed with no waiting worker, and cache
`diagram-source-studio-v0.1.10` existed. After switching the browser offline,
`/demo` reloaded with HTTP 200 and rendered a newly entered D2 diagram without
console or page errors.

## Billing and request allowance

The live catalog lists Diagram Source Studio at USD 3,900 minor units ($39).
Checkout returns HTTP 303 to `checkout.dodopayments.com`, whose page returned
200. An invalid verify token returned a no-store 200 verdict with
`reason: "invalid"`.

Forty concurrent verify requests from one client yielded **30 HTTP 200 and 10
HTTP 429** responses. Every 429 included `Retry-After: 4` (and
`X-RateLimit-After: 4`). The observed allowance is therefore 30 requests in
that concurrent window. No real purchase was made; purchase, return-token,
daily cache, offline enforcement, and revocation behavior passed recorded
claim fixtures.

## Performance and bundle budgets

Fresh live mobile Lighthouse runs:

| Route | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 98 | 100 | 100 | 100 | 1.654 s | 121 ms | 0 | 174,387 B |
| `/demo` | 99 | 100 | 100 | 100 | 1.306 s | 102 ms | 0.00024 | 99,350 B |

Both meet the supplied LCP, blocking-time, layout-shift, accessibility, and
initial-transfer budgets. Built initial assets are also within budget:

- main JavaScript: 35,897 B raw / 12.99 KB gzip;
- core JavaScript: 2.48 KB raw / 1.01 KB gzip;
- CSS: 17,056 B raw / 4.65 KB gzip;
- four self-hosted fonts: 79,552 B total;
- mobile hero WebP: 24,900 B.

The multi-megabyte Mermaid version bundles are deferred until the editor needs
them and are not part of the first landing transfer.

## Deployment and desktop release identity

The fresh build and production deployment match byte-for-byte: **31 public
files matched, 0 mismatched, 0 fetch failures**. Host-only
`staticwebapp.config.json` was correctly excluded. Representative SHA-256:

| File | SHA-256 |
| --- | --- |
| `index.html` | `0c2a07804897b9211c3a6912c710459dce539700cf1966d64a646005a37d05f5` |
| `demo.html` | `a9a6f05a4dca119da932b4206dc164779151be37e12659f76ae43dd27d5687b5` |
| `sw.js` | `b7e35ff913092644958151681630a3d98add36c8046fd330f4cb69ff0ffabbbf` |
| main JS | `57b3fbb25b70e2add8f46fbad9a798195e712ef06c634fc51c1f15ba1824e58f` |

GitHub release `v0.1.10` was published at 2026-08-29T12:11:57Z. Its
`latest.json` records candidate commit
`5fb973e5dcfbd05e5014cd5e0d2671b29fea2766` and lists macOS arm64/x64,
Windows, Linux AppImage, and Linux deb assets. Release workflow run
`33251516458` has the same `head_sha`; metadata, quality, live billing, four
platform builds, and publish all succeeded.

I downloaded and checksum-verified the macOS app archive and Linux deb. The deb
reports version 0.1.10, amd64, and resolved shared-library dependencies. The
live `install.sh` downloaded and checksum-verified the 80,587,256-byte AppImage
into an isolated prefix. Running it under Xvfb produced a 1440×900 window named
**Diagram Source Studio** and remained alive through the smoke interval. The
packages are intentionally unsigned and the page discloses that fact.

## Evidence and residual notes

Machine-readable logs, request records, Lighthouse reports, screenshots,
release jobs, hashes, installer output, and native smoke output are under
`.factory/verification-artifacts-10/`.

Residual non-defects:

- macOS and Windows bundles were built and gated by GitHub-hosted runners but
  were not launched on this Linux verifier host.
- Desktop packages are intentionally unsigned pending owner certificates.
- Compact D2 intentionally supports the disclosed nodes, labels, and arrows
  subset rather than the full D2 language.
