# Check diagram renders before commit — review 5

- Reviewed: 2026-09-06
- Live URL: <https://diagram-source-studio.sociobot.in>
- Implementation candidate: `f2a906680d470b70ca1558e59dcf62f82955d645`
- Documentation commit reviewed: `0c4ea4d75af86e3e56e4b2ccf43994d426d015ca`
- Desktop release: [`v0.1.13`](https://github.com/B-Divyesh/sf-diagram-source-studio/releases/tag/v0.1.13)

## Verdict

**PASS — accept the candidate.**

- Finding count: **0**
- Untested public claim count: **0**
- Severity count: **0 critical, 0 high, 0 medium, 0 low**

The live site, isolated demo, clean checkout, published release, live
installers, and installed Linux app match the candidate and pass the product
contracts. This review changed no product code.

## First screen

Fresh 1440×900 desktop and 390×844 phone contexts opened at scroll position
zero. Before scrolling, both state:

- Job: **Catch broken diagram renders before commit**.
- Audience: engineers who keep Mermaid or D2 files in Git and need to inspect
  real output.
- First action: **Try it with sample data**. Adjacent copy says it loads a
  Mermaid project in the browser.

The local-file, offline-editing, and $39 one-time-price facts also fit. The
lowest required item ends at 755 px on desktop and 540 px on phone. Neither
view has horizontal overflow or a console/page error.

## Sample and editor paths

One click opened a realistic 215-byte Mermaid project with diagnostics and a
rendered SVG. The demo retained **Demo — sample data, nothing is saved**,
**Reset demo**, and **Start for real**.

- Editing produced a repository-style source → API → Git review diagram.
- SVG export was 1,297 bytes and restored the exact edited source from its
  metadata. PNG export was 43,697 bytes with the correct PNG signature.
- Reset restored the original sample. A `REAL-DO-NOT-TOUCH` sentinel remained
  unchanged, and the demo created no real document or license key.
- Empty Mermaid, malformed Mermaid, and no-node D2 input produced specific
  recovery text. **Load working sample** recovered the preview.
- Compact D2 rendered `Café ☕`, `你好世界`, and a `naïve route` edge label.
- An invalid license failed closed. The live browser and installed app both
  retained the purchase link after the failed check.

The claim suite also covers BOM, CRLF, and Unicode round trips in SVG and PNG;
active SVG cleanup; offline license enforcement; the exact one-day verdict
cache boundary; refund revocation; and duplicate export-handler prevention.

## Declared claims

The clean checkout contains 21 claims. Each ID has exactly one tagged test.
Every literal `test` command in `.factory/claims.json` was run separately after
installing the documented prerequisites.

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

The live landing page, editor, legal pages, and README were compared with the
manifest. No false, incomplete, unlisted, or untested public claim was found.

## Clean checkout and quality gates

The clean clone was checked out at documentation commit `0c4ea4d`. Its product
files are unchanged from implementation candidate `f2a9066`; only verification
documentation and evidence differ.

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

PowerShell and the Linux Tauri development libraries were absent from the
worker. PowerShell 7.5.3 and the exact Ubuntu packages documented in README
were installed. The first Rust attempt stopped before product compilation at
missing `glib-2.0`; every Rust command passed after setup.

The production build remains within budget: main JavaScript is 36,282 bytes
raw / 13,165 bytes gzip, CSS is 17,056 / 4,670 bytes, core JavaScript is 2,483
/ 1,032 bytes, and fonts total 79,552 bytes. Fresh mobile Lighthouse performance
was 99 on `/` and 100 on `/demo`; LCP was 1.65 s and 1.44 s, TBT was 0 ms on
both, and CLS was 0.016 and 0.002.

## Live routes, accessibility, privacy, and offline use

- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown path returns
  the expected HTTP 404 with the designed **Page not found** screen and home
  link. The deliberate 404 is not a defect.
- Every route has its own title and canonical URL, `lang=en`, one h1, one main
  landmark, ordered headings, shared navigation, and a footer.
- Fresh Axe checks reported zero violations of any severity on all five
  routes. `verify-url.sh` passed `/` and `/demo` with no console errors.
- Keyboard focus starts at the skip link. Enter moves focus to `main`.
  Source/Preview tabs work with arrow keys. Back navigation restores the route
  and focuses its h1. Focus remains visible.
- Every visible phone control measured at least 44 px high. A 200%-zoom
  equivalent check had no horizontal overflow on the landing page or demo.
- Reduced-motion mode reduced the maximum transition/animation duration to
  0.01 ms. No loop or flash was present.
- A direct `/demo` load made no external request. The cold landing made only
  the disclosed bodyless GitHub release and Sociobot catalog GETs. Editing and
  export sent no source off origin. No tracking, analytics, external font, or
  external script request appeared.
- HSTS, `nosniff`, strict-origin referrer policy, denied camera/microphone/
  geolocation permissions, and a matching CSP with `frame-ancestors 'none'`
  are present.
- The service worker controls `/demo`, has no waiting update, and uses cache
  `diagram-source-studio-v0.1.13`. Offline reload and a new D2 render passed.
- All rendered destinations resolved. Expected checkout and asset redirects
  succeeded; the deliberate unknown route was the only 404.

No application updater is advertised or configured, so a desktop update path
is not applicable.

## Release and installed desktop app

Tag `v0.1.13` peels to implementation `f2a9066`. Release workflow
`34011343508` has the same head SHA; its metadata, live billing, quality,
Linux, Windows, both macOS, and publish jobs all succeeded. `latest.json`
records the same commit and five platform targets, and every target returned
200.

The live shell installer installed the Linux AppImage into an isolated prefix.
Its 82,885,112-byte file has SHA-256
`af801ea6ab22df5b9f1122c5fa55199c8bd1e3b7afa7564243df801d33ebd717`,
matching `SHA256SUMS`. The live PowerShell installer downloaded and verified
the Windows MSI without installing it on Linux.

In a clean XDG profile under Xvfb, the installed AppImage opened a 1440×900
native window with the 215-byte sample, successful diagnostics, and rendered
preview. It loaded **Buy Studio for $39 once** through the native billing
bridge. Pasting `not-a-valid-license` returned **This license is no longer
active** and kept the buy link. The only process messages were expected Xvfb
EGL/DRI3 acceleration warnings.

The fresh `dist/site` build and live deployment matched byte-for-byte across
all 31 deployable files. Desktop packages remain intentionally unsigned and
the site discloses this. macOS and Windows packages were built and tested by
their native GitHub runners but were not launched on this Linux host.

## Earlier finding disposition

Every earlier review, polish, verification, and handoff report was inspected,
including minor and low findings.

| Earlier finding | Current proof | Status |
| --- | --- | --- |
| Unverified token enabled Studio offline | `license-enforcement` fails closed | Fixed |
| Catalog/checkout was missing | Live catalog is USD 3900; checkout reaches Dodo with 303/200 | Fixed |
| Successful checkout returned no license | Verification 6 recorded the redacted completed return flow; current return tests pass | Fixed |
| Demo wrote real document or license data | Fresh sentinel/storage check and `demo-sandbox` pass | Fixed |
| CRLF/BOM/Unicode source changed | SVG/PNG and native byte-round-trip tests pass | Fixed |
| SPA remount duplicated export handlers | `@regression:route-remount` passes | Fixed |
| Release URLs or installers were broken | Five release URLs and both live installers pass checksum checks | Fixed |
| Desktop release predated the candidate | Tag, workflow, and `latest.json` identify `f2a9066` | Fixed |
| Claim inventory was incomplete | 21 entries have one test each; public copy is fully mapped | Fixed |
| Native file claim only checked controls | Tauri command round trip and native byte test pass | Fixed |
| Daily cache and refund revocation lacked tests | Both exact claim commands pass | Fixed |
| Full `npm test` crashed near offline/no-tracking | Full suite passes without retry or skip | Fixed |
| First-screen action or facts fell below the fold | Fresh desktop and phone bounds fit | Fixed |
| Phone controls were under 44 px | All 17 visible controls are at least 44 px high | Fixed |
| Demo/landing performance missed budget | Fresh Lighthouse performance is 100/99 | Fixed |
| Initial focus bypassed the skip link | Skip link is first and moves focus to main | Fixed |
| Hashed assets revalidated after 30 seconds | Hashed assets and renderer bundles use immutable one-year caching | Fixed |
| D2 was described as full support | Copy states the compact nodes/labels/arrows subset | Fixed |
| Landing anchors were dead | Fresh rendered-link crawl passes | Fixed |
| Route canonical/social metadata was shared | Route-specific metadata passes | Fixed |
| Unknown routes returned 200 or used metaphor copy | Unknown route returns 404 and says **Page not found** | Fixed |
| Demo docs named the wrong renderer | Demo docs and sample state 11.17.2 | Fixed |
| Native startup duplicated an undisclosed catalog call | `billing-catalog` proves one disclosed native request | Fixed |
| README omitted PowerShell | README names PowerShell 7; the guard checks it | Fixed |
| Demo lacked the standard header/footer | Fresh demo has home/legal navigation and footer | Fixed |
| README sentences exceeded 22 words | Current copy audit has no violation | Fixed |
| Headings used jargon, mixed terms, or decorative labels | Current headings and terms are plain and consistent | Fixed |
| Release claims did not test Windows or workflow matrix | Claim tests both installers and the four-platform workflow | Fixed |
| Installed app billing failed on Tauri CORS | Fresh installed AppImage loads the catalog and verifies through the native bridge | Fixed |
| Invalid native license replaced the buy link | Fresh installed AppImage rejects it and retains the buy link | Fixed |

Reviews 3 and verifications 7, 8, 10, and 11 had zero findings; their passing
areas remain passing.

## Scope

This is a static site plus a Tauri desktop app. It has no product-owned
backend, tenant store, SQLite service, health endpoint, or restart-persistence
claim, so those backend checks do not apply. A separate public billing check
sent 40 concurrent invalid-token requests: 30 returned 200 and 10 returned 429;
every 429 included `Retry-After: 4`.

No missed AI, import/export, or sync feature is identified. Local file
open/save, renderer comparison, diagnostics, offline references, and editable
exports cover the researched job. Sending private diagram source to an AI
service would conflict with the product boundary.
