# Check diagram renders before commit — verification 11

- Verified: 2026-09-06
- Live URL: <https://diagram-source-studio.sociobot.in>
- Implementation candidate: `f2a906680d470b70ca1558e59dcf62f82955d645`
- Documentation base reviewed: `44191b81ee956ca87ba41172278bf347560d20c8`
- Release: [`v0.1.13`](https://github.com/B-Divyesh/sf-diagram-source-studio/releases/tag/v0.1.13)

## Verdict

**PASS — accept the candidate.**

- Finding count: **0**
- Untested public claim count: **0**
- Severity count: **0 critical, 0 high, 0 medium, 0 low**

The live site, demo, clean repository, release metadata, live installers, and
installed Linux desktop artifact all match the candidate and pass the supplied
contracts. No product code was changed during verification.

## First screen

Fresh contexts opened at scroll position zero. Before scrolling, both a
1440×900 desktop browser and a 390×844 phone browser state:

- Job: **Catch broken diagram renders before commit**.
- Audience: engineers who keep Mermaid or D2 files in Git and need to inspect
  real output.
- First action: **Try it with sample data**. The adjacent text says that it
  loads a Mermaid project in the browser.

The local-file, offline-editing, and $39 one-time-price facts also fit. The
lowest fact ends at y=755 of 900 on desktop and y=540 of 844 on phone. Neither
viewport has horizontal overflow or a console/page error.

## Sample and product paths

One click opened the demo with a realistic 215-byte Mermaid project, rendered
SVG output, and the persistent **Demo — sample data, nothing is saved** label.
The label retained **Reset demo** and **Start for real**.

- Editing rendered a repository-style source → API → Git review diagram.
- SVG export was 1,297 bytes and restored the exact edited source from its
  metadata. PNG export was 43,697 bytes with the correct PNG signature.
- Reset restored the original sample exactly.
- A `REAL-DO-NOT-TOUCH` local-storage sentinel remained unchanged. No real
  document or license key was created during the demo.
- Empty Mermaid, malformed Mermaid, and no-node D2 input gave specific recovery
  text. **Load working sample** recovered the preview.
- Compact D2 rendered `Café ☕`, `你好世界`, and a `naïve route` edge label.
- The browser sample's invalid-license path failed closed with **This license is
  no longer active**.

Normal, invalid, boundary, and recovery behavior therefore passed. The
separate claim suite also proves BOM, CRLF, and Unicode SVG/PNG source round
trips; adversarial SVG cleanup; offline license enforcement; cached verdict
expiry; refund revocation; and one-handler export behavior.

## Declared claims

The clean checkout contains 21 claims. Each ID appears in exactly one tagged
test. Every exact `test` command from `.factory/claims.json` was run separately
after the documented prerequisites were installed.

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

The live landing page, editor, legal copy, and README map to these claims. No
unlisted, false, incomplete, or untested public claim was found. Evidence for
each command is under `verification-artifacts-11/claims/`.

## Clean checkout and quality gates

The clean clone began at documentation commit `44191b8`. Its only difference
from implementation `f2a9066` is `.factory/handoff.md`, so the tested product
files are the implementation candidate.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 186 packages, 0 vulnerabilities |
| All 21 claim commands | PASS individually |
| `npm test` | PASS — 13 route/accessibility tests, 21 isolated claims, 5 regressions |
| `npm run build` | PASS — TypeScript and Vite emitted `dist/site/` |
| `npm run verify:release` | PASS — `v0.1.13` |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `npm run test:live:billing` | PASS — USD 3900, checkout 303, hosted page 200 |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo test --locked --manifest-path src-tauri/Cargo.toml` | PASS — 2 native tests |
| `cargo check --locked --manifest-path src-tauri/Cargo.toml` | PASS |
| `cargo clippy --locked --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` | PASS |

The worker initially lacked PowerShell and the Tauri Linux development
libraries. The normal package source did not contain PowerShell, so the
documented official portable PowerShell 7.5.3 package was used. The exact
README Ubuntu Tauri packages were then installed. The pre-compilation Rust
attempt stopped at missing `glib-2.0`; all commands passed after setup. No
claim command failed.

The build remains within budget: main JavaScript is 36,282 bytes raw / 13,165
bytes gzip, CSS is 17,056 / 4,670 bytes, core JavaScript is 2,483 / 1,032
bytes, fonts total 79,552 bytes, and the mobile hero is 24,900 bytes.

## Live routes, accessibility, and privacy

- `/`, `/demo`, `/privacy`, and `/terms` return 200. The unknown path returns
  the expected HTTP 404 with the designed **Page not found** screen and a home
  link. A deliberate 404 is not counted as a defect.
- Every route has its own title and canonical URL, `lang=en`, one h1, one main
  landmark, ordered headings, shared navigation, and a footer.
- Playwright Axe reported no violations of any severity on all five routes.
  `verify-url.sh` passed `/` and `/demo` with no console errors.
- Keyboard focus begins at the skip link. Enter moves focus to `main`.
  Source/Preview tabs work with arrow keys. Back navigation restores the route
  and focuses its h1. Focus styling remains visible.
- Every visible phone control measured at least 44 px high. The 200%-zoom
  equivalent reflow check had no horizontal overflow on the landing or demo.
- Reduced-motion mode reduced the maximum transition or animation duration to
  0.01 ms. No loop or flash was present.
- Demo editing and export made no source-bearing external request. The cold
  landing made only the disclosed bodyless GitHub release and Sociobot public
  catalog GETs. Fonts, scripts, and renderers were same-origin; no tracking or
  analytics request appeared.
- Security responses include HSTS, `nosniff`, strict-origin referrer policy,
  camera/microphone/geolocation denial, and a matching CSP with
  `frame-ancestors 'none'`. Hashed assets and renderer bundles have one-year
  immutable caching; documents and `sw.js` revalidate after 30 seconds.
- All rendered destinations resolved. The GitHub asset uses its expected 302,
  checkout uses its expected 303 to Dodo Payments, and the deliberate unknown
  route is the only 404.

The live service worker controls `/demo` with cache
`diagram-source-studio-v0.1.13`. After switching a fresh context offline, the
page reloaded and rendered a new D2 diagram. No updater is advertised or
configured, so an application-update path is not applicable.

Fresh mobile Lighthouse results:

| Route | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 97 | 100 | 100 | 100 | 2.445 s | 32 ms | 0 | 184,977 B |
| `/demo` | 100 | 100 | 100 | 100 | 1.213 s | 0 ms | 0.00024 | 99,622 B |

## Release and installed desktop app

Tag `v0.1.13` peels to implementation `f2a9066`. Release workflow
`34011343508` has the same head SHA; metadata, billing, quality, Linux,
Windows, both macOS builds, and publish jobs all succeeded. `latest.json`
records the same commit and five platform targets. Every target URL responded.

The Linux AppImage is 82,885,112 bytes. Its SHA-256 is
`af801ea6ab22df5b9f1122c5fa55199c8bd1e3b7afa7564243df801d33ebd717`,
exactly matching `SHA256SUMS`. The live shell installer installed that checksum
to an isolated prefix. The live PowerShell installer downloaded and verified
the MSI without installing it on Linux.

In a clean XDG profile under Xvfb, the checksum-verified AppImage opened a
1440×900 native window with the 215-byte sample, successful diagnostics, and a
rendered preview. It loaded **Buy Studio for $39 once**. Pasting the benign
token `not-a-valid-license` returned **This license is no longer active** and
retained the buy link. This directly closes Review 4's desktop CORS finding
and the temporary catalog-state regression. The only process log entries were
expected Xvfb EGL/DRI3 acceleration warnings.

The live static deployment also matches the clean `dist/site` build: all 30
deployable files compared byte-for-byte, with zero mismatches. The host-only
`staticwebapp.config.json` was correctly excluded.

Desktop packages remain intentionally unsigned and the site discloses that
fact. macOS and Windows artifacts were built and gated on their native GitHub
runners but were not launched from this Linux verifier.

## Earlier finding disposition

Every earlier review and verification file was read. The following table
includes the earlier minor and low items, not only release blockers.

| Earlier finding | Current proof | Status |
| --- | --- | --- |
| Unverified token enabled Studio offline | `license-enforcement` fails closed | Fixed |
| Production catalog or checkout missing | Live billing shows USD 3900, checkout 303, Dodo page 200 | Fixed |
| Successful checkout returned no license | Verification 6 records the completed redacted return-token flow; current return/caching tests pass | Fixed |
| Demo wrote real document or license keys | Fresh sentinel/storage check and `demo-sandbox` pass | Fixed |
| CRLF/BOM/Unicode source changed | SVG/PNG and native byte-round-trip tests pass | Fixed |
| SPA remount duplicated export handlers | `@regression:route-remount` passes | Fixed |
| Release URLs and installers were broken | Five URLs respond; both live installers verify checksums | Fixed |
| Desktop release predated the candidate | Tag, workflow, and `latest.json` all identify `f2a9066` | Fixed |
| Claim inventory was incomplete | 21 manifest entries, one tag each, all public copy mapped | Fixed |
| Native file-dialog claim checked only controls | Tauri invoke round trip and native byte test pass | Fixed |
| Daily verdict cache and refund revocation lacked tests | Both exact claim commands pass | Fixed |
| Full `npm test` crashed near offline/no-tracking | Full suite passes once with no retry or skip | Fixed |
| First action or complete fact package fell below fold | Fresh desktop and phone bounds fit | Fixed |
| Phone controls were below 44 px | All 17 visible controls are at least 44 px high | Fixed |
| Demo/landing performance missed budget | Lighthouse is 100/97 performance; bundles pass budgets | Fixed |
| Initial focus bypassed the skip link | Skip link is first and moves focus to main | Fixed |
| Hashed assets revalidated after 30 seconds | Hashed assets and renderers now use immutable one-year caching | Fixed |
| D2 was described as full support | Public copy says compact nodes, labels, and arrows subset | Fixed |
| Landing anchors were dead | Rendered-link crawl passes | Fixed |
| Route canonical/social metadata was shared | Route-specific metadata passes | Fixed |
| Unknown routes returned HTTP 200 or used metaphor copy | Unknown route returns 404 and says **Page not found** | Fixed |
| Demo documentation named the wrong renderer | Demo docs and sample state 11.17.2 | Fixed |
| Native startup duplicated an undisclosed catalog call | `billing-catalog` proves one disclosed native request | Fixed |
| README omitted PowerShell | README names PowerShell 7 and the guard detects its absence | Fixed |
| Demo lacked the standard header/footer | Fresh demo has home/legal navigation and footer | Fixed |
| README sentences exceeded 22 words | Current copy audit has no violation | Fixed |
| Headings used jargon, mixed terms, or decorative labels | Current headings and terminology are plain and consistent | Fixed |
| Release claims did not test Windows or workflow matrix | Release claim tests both installers and four-platform workflow | Fixed |
| Installed app billing failed on Tauri CORS (F-4-1) | Native AppImage loads buy link and verifies invalid token through bridge | Fixed |
| Invalid license check replaced the native buy link | Native screenshot and `@regression:catalog-ready` retain it | Fixed |

Reviews 3 and verifications 7, 8, and 10 had zero findings; their passing areas
remain passing. No missed AI, import/export, or sync feature is identified:
local file open/save, comparison, diagnostics, offline reference, and editable
exports cover the researched job. Sending private diagram source to an AI
service would conflict with the product boundary.

## Scope and evidence

This product is a static site plus a Tauri desktop app. It has no product-owned
backend, tenant store, SQLite service, health route, or restart-persistence
claim, so backend tenant/restart/health checks do not apply. As an additional
public billing check, 40 concurrent invalid-token requests produced 30 HTTP
200 and 10 HTTP 429 responses; every 429 included `Retry-After: 4`.

Evidence is in [verification-artifacts-11](verification-artifacts-11/),
including live screenshots, browser results, Axe results, Lighthouse JSON,
claim logs, Rust logs, deployment hashes, link results, release metadata,
checksums, installer logs, and native screenshots.
