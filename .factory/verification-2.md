# Independent product verification 2 — FAIL

Verified on 2026-08-28 against candidate commit `e207c108684e96cf5b55694629b7fcb2d5bdc18d` and <https://diagram-source-studio.sociobot.in>.

## Verdict

**FAIL — do not release.** The repaired application and desktop release pass the independent product, quality, accessibility, privacy, PWA, installer, and deployment-identity checks below. Production still cannot sell its advertised one-time Studio license: the required Sociobot product is absent from the live catalog and its checkout endpoint returns 404. That makes the paid product incomplete end to end.

## First-read gate — PASS

A cold 1440 × 900 browser opened the live page with no console or page error. The first screen says:

- **Does:** “Catch broken diagram renders before commit.”
- **For whom:** “For engineers who keep Mermaid or D2 files in Git and need to inspect real output.”
- **First action:** the visible one-click **“Try it with sample data”** action, captioned “Loads a Mermaid project in the browser.”

It also shows the required three plain facts: local files, offline core editing, and price. The primary action and populated demo both work.

## Release-blocking finding

### High — production checkout is not registered

The live `GET https://api.sociobot.in/api/v1/products` catalog, checked after rate-limit recovery, contains no product whose slug is `diagram-source-studio`. Direct `GET https://api.sociobot.in/api/v1/products/diagram-source-studio/checkout` returned **HTTP 404** and:

```json
{"error":"enabled factory product","status":404}
```

The site safely suppresses a dead Buy link and says purchases are temporarily unavailable, but the researched brief and paid-unlock contract require an actual one-time purchase. Register/enable the exact USD 3900 Sociobot product with return URL `https://diagram-source-studio.sociobot.in/`, then verify a complete checkout and return-token flow before release.

## Claims gate — PASS

`.factory/claims.json` exists and lists 14 claims. After `npm ci` from the clean checkout, I ran every exact manifest command against the product’s demo entry point. All passed (one matching Playwright test per command):

| Claim ID | Result |
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
| `studio-purchase` | PASS (fixture/unit eligibility assertion; it does not prove live catalog registration) |

The final row explains why the claims gate cannot override the live checkout finding: its test supplies a recorded enabled-product catalog response, whereas the live catalog has no such product.

## Repository and release gates

| Check | Independent result |
| --- | --- |
| `npm ci` | PASS — 186 packages installed; `npm audit --audit-level=high` reported 0 vulnerabilities |
| `npm test` | PASS — 25 Playwright tests, including accessibility, claims, routes, mobile, and event cleanup |
| `npm run build` | PASS — TypeScript `--noEmit` and Vite production build; output `dist/site/` |
| Production shell budget | PASS — main JS 34.08 KB raw / 12.44 KB gzip; CSS 17.01 KB raw / 4.79 KB gzip; fonts 79.55 KB total |
| Linux installer | PASS — `XDG_BIN_HOME=<temp> sh public/install.sh` installed the 80,583,160-byte AppImage successfully |
| Release | PASS — `v0.1.4^{}` resolves to `e207c108684e96cf5b55694629b7fcb2d5bdc18d`; latest manifest lists all five required platforms |
| Artifact integrity | PASS — downloaded `Diagram.Source.Studio_0.1.4_amd64.deb` is version 0.1.4 amd64 and SHA-256 matches `SHA256SUMS` (`f8281ce4…88d95c5`) |
| Rust native checks | PASS — after installing the release workflow’s Linux GTK/WebKit prerequisites: `cargo fmt --check`, `cargo check --locked`, `cargo test --locked` (0 tests), and `cargo clippy -- -D warnings` all passed |

## Live end-to-end and privacy checks — PASS

- `/demo` displays the persistent “Demo — sample data, nothing is saved” banner, populated Mermaid sample, Reset demo, and Start for real.
- Mermaid normal input rendered; malformed input produced a parse diagnostic and **Load working sample** recovered. Compact D2 rendered nodes, arrow label, and Unicode `Café ☕` correctly.
- A direct live export/import probe preserved a UTF-8 BOM plus CRLF source byte-for-byte (52 source bytes before and after) in SVG metadata.
- With a fulfilled valid fixture, demo licensing activated without writing any `sb_license:*` or `real:*` local-storage keys. With an unverified stored token and the verify request forced offline, the native-shell editor showed “Connect once to verify this license” and rendered zero matrix panels.
- The demo edit/render/export flow made no outbound request and logged no console/page errors. Mermaid output sanitization is covered by the adversarial SVG claim test.
- The service worker controlled `/demo`; after one online visit, an offline reload rendered a newly entered D2 graph successfully.
- No sign-in exists; Entra tenant validation is not applicable. No AI feature is implied by the brief.

## Accessibility, mobile, and performance

- Live axe scans at 1440 × 900 and 390 × 844 on `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page`: **0 serious or critical violations**. Each had exactly one `h1`, a `main`, a route-specific title, no console/page errors, and no horizontal overflow.
- At 390 px, Source/Preview tabs work with Left/Right arrows and the focused Source tab has a visible `rgb(54, 241, 228) solid 3px` outline. The mobile demo showed all editor controls with no overlap.
- With reduced-motion emulation, transition and animation durations compute to `0.00001s`.
- Security responses include HSTS, CSP with `frame-ancestors 'none'`, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denial. Hashed main JS uses `Cache-Control: public, max-age=31536000, immutable`.
- An attempted fresh Lighthouse 12 mobile run produced a report with accessibility/best-practices/SEO 100, but Chrome crashed while closing and warned that this worker CPU was slower than calibration; its performance 68/LCP 3.3 s/TBT 1,190 ms is therefore **inconclusive**, not an acceptance measurement. Static asset budgets pass; rerun Lighthouse in a non-contended release worker before a repaired acceptance.

## Deployment identity and API policy

- Live `assets/index-B3oszJVs.js` SHA-256 is `99b969d450fa41e4bac79c443a4466755ba507137e67c78cd6472b8f035d9856`, exactly matching the candidate build. Live `sw.js` also matches candidate bytes (`b0fcf515…0974dd96`).
- A 60-request concurrent burst to the product verify endpoint admitted 30 HTTP 200 responses and returned 30 HTTP 429 responses, each with `Retry-After: 4`. Rate limiting therefore works; concurrency makes request completion order unsuitable as a serial threshold.

## Required next step

Enable the $39 product in the Sociobot production catalog, confirm the live Buy action reaches hosted checkout and returns a verifiable license token, then rerun checkout and Lighthouse performance checks. No product-code change was made by this verification.
