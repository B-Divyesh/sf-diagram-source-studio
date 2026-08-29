# Independent product verification 9 — FAIL

Verified 2026-08-29 from candidate commit
`a58e66b1dbe72795afaa089e03832c887327948a` against
<https://diagram-source-studio.sociobot.in>.

## Verdict

**FAIL — do not release this candidate.** The live web deployment is an exact
match for the candidate and the usable product paths are healthy, but the
desktop downloads are not builds of this candidate. Release `v0.1.9` was built
from commit `4ad88c46805adeb301cd321c4826f141c991e99a` at 07:00 UTC, before
the candidate's product changes at `3e9f278` and final candidate commit at
10:09 UTC.

The artifact class is `desktop-app`, so publishing older desktop binaries
prevents acceptance even though the web deployment is current. All 21 declared
claim tests pass after their platform prerequisites are installed.

No product code was modified during this verification.

## Release-blocking findings

### V9-1 — HIGH — downloadable desktop apps predate the candidate

The latest release is `v0.1.9`, published 2026-08-29 at 07:08 UTC. Its annotated
tag resolves as follows:

```text
refs/tags/v0.1.9 -> f3f65e2a1ee7407089e504f7cae94493166ac21d
tag target         4ad88c46805adeb301cd321c4826f141c991e99a
release workflow   head_sha 4ad88c46805adeb301cd321c4826f141c991e99a
candidate          a58e66b1dbe72795afaa089e03832c887327948a
```

Commit `4ad88c4` is an ancestor of the candidate. Product code changed after
that tag, including `src/editor.ts`, `src/main.ts`, `src/styles.css`, and
`public/install.ps1`. The changes include the accepted first-screen sizing,
demo route navigation/footer, plain 404 and editor wording, and Windows
installer test support. The current landing page still directs users to the
older `v0.1.9` AppImage and GitHub Release.

Required repair: publish a new version from the accepted candidate lineage,
with all Linux, Windows, macOS arm64, and macOS x64 assets, checksums, and a
matching manifest. Do not move the existing immutable version tag.

### V9-2 — MEDIUM — the README omits a required test executable

After `npm ci`, `npm test -- --grep @claim:release-installers` initially failed
with `Error: spawn pwsh ENOENT`. The claim intentionally exercises
`public/install.ps1`, but the README's test instructions do not state that
PowerShell is required. After provisioning the current portable PowerShell for
Linux, the exact claim command passed in 5.9 seconds and the complete
`npm test` suite passed. This is a documentation/setup defect, not a failing
product assertion.

Required repair: list PowerShell under test prerequisites or provide a setup
command that installs every executable invoked by `npm test`.

## Mandatory first-read and demo gates

**PASS.** A cold 1440×900 live load answers all three required questions in
plain words without scrolling:

- What it does: **“Catch broken diagram renders before commit.”**
- For whom: **“For engineers who keep Mermaid or D2 files in Git and need to
  inspect real output.”**
- What to click first: **“Try it with sample data.”** The adjacent sentence
  says it loads a Mermaid project in the browser.

The action opens `/?demo=1` in one click with a 215-byte sample already
rendered. It shows the persistent **“Demo — sample data, nothing is saved”**
banner, **Reset demo**, and **Start for real**. A sentinel in
`real:diagram-source-studio:document` survived editing, exporting, switching
languages, and resetting. Reset restored the shipped Mermaid sample.

The full first-screen package also fits: the third fact ends at 755.1 px in a
900 px desktop viewport and 539.7 px in a 844 px mobile viewport.

## Claims gate

The manifest exists and contains 21 entries, each with one exact tagged test.
After `npm ci` and provisioning the PowerShell executable required by the
cross-platform installer test, every exact command passed:

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
| `release-installers` | PASS — shell and PowerShell success/rejection fixtures |
| `studio-purchase` | PASS |
| `billing-catalog` | PASS |
| `license-verdict-one-day` | PASS |
| `refund-revocation` | PASS |
| `no-sign-in` | PASS |
| `free-editor-diagnostics` | PASS |
| `startup-network` | PASS |
| `checkout-provider` | PASS |

The landing, legal pages, and README were cross-checked against the manifest.
No additional material product promise lacked a corresponding listed claim.

## Local install, tests, and builds

| Check | Result |
| --- | --- |
| Clean commit | PASS — HEAD and `origin/main` both equal candidate `a58e66b` |
| `npm ci` | PASS — 186 packages, 0 vulnerabilities |
| All 21 claim commands, individually | PASS |
| `npm test` | PASS — 13 accessibility/route tests, 21 claims, 4 regressions |
| `npm run build` | PASS — TypeScript and Vite production build emit `dist/site/` |
| Type check | PASS — `tsc --noEmit` is part of the production build |
| Lint | Not configured in `package.json` |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml --locked` | PASS — 1 native byte-round-trip test |
| `npm run test:live:billing` | PASS |

The first Rust attempt correctly reported missing host `glib-2.0`. After
installing the exact Linux Tauri prerequisites declared by the release
workflow (`libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, and
`patchelf`), the native test compiled and passed in 4m40s. The first installer
claim attempt likewise exposed the undocumented PowerShell prerequisite in
V9-2; with portable PowerShell available, both that claim and the full suite
passed.

Per the installer contract, no platform bundle was built in the factory
worker. Published GitHub Actions artifacts were inspected instead.

## End-to-end product exercise

- A Unicode Mermaid graph containing **Café ☕**, API, and Database rendered
  with all labels present.
- Empty source produced **“The source is empty. Type a diagram or load the
  sample.”** and a working **Load working sample** recovery action.
- Malformed Mermaid produced a version-specific parse error and recovered via
  the same action.
- Compact D2 rendered Client, API, and a labelled `request` arrow. An invalid
  line produced the specific warning **“Line 2 is not part of the compact D2
  syntax.”** while valid content remained rendered.
- SVG export contained source metadata, restored the exact Unicode input, and
  contained no scripts, objects, handlers, or external URLs. The passing
  `editable-export` claim additionally proves BOM/CRLF/Unicode byte-for-byte
  SVG and PNG round trips.
- The paid two-renderer path, license return, daily verdict cache, offline
  enforcement, and refund revocation passed their recorded-response claim
  tests. No real purchase was made.
- No sign-in is present or required, so the Entra authority requirement is not
  applicable.

## Privacy and network evidence

A cold landing request log contained only:

- same-origin HTML, hashed JS/CSS, fonts, and original hero art;
- `GET https://api.github.com/repos/B-Divyesh/sf-diagram-source-studio/releases?per_page=1`;
- `GET https://api.sociobot.in/api/v1/products`.

The two external requests had no body and contained no diagram source. After
the demo loaded, editing, rendering, resetting, and SVG export made only one
same-origin renderer request (`/vendor/mermaid-11.min.js`) and no external
request. There were no analytics, telemetry, third-party scripts, or external
fonts.

The live document headers include:

- `Content-Security-Policy` with `default-src 'self'`, restricted connect
  origins, `object-src 'none'`, and `frame-ancestors 'none'`;
- `Strict-Transport-Security: max-age=10886400; includeSubDomains; preload`;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- denied camera, microphone, and geolocation permissions.

Documents and `sw.js` use `public, must-revalidate, max-age=30`. Hashed assets
use `public, max-age=31536000, immutable`.

## Accessibility, keyboard, mobile, and motion

- `/opt/fleet/lib/verify-url.sh` passed live `/` and `/demo`: correct title,
  `lang`, one h1, main landmark, alt text, named buttons, and zero console/page
  errors.
- Live Axe WCAG 2 A/AA/2.1 AA scans found **0 violations**, including zero
  serious/critical findings, on desktop `/`, `/demo`, `/privacy`, `/terms`,
  the designed 404, and 390 px `/demo`.
- At 390×844 there is no horizontal overflow and no visible interactive target
  smaller than 44×44 CSS px.
- Keyboard focus begins at **Skip to main content** with a visible 3 px cyan
  outline. Enter moves focus to `main`. ArrowRight moves the mobile pane tab
  from Source to Preview and updates `aria-selected`.
- History navigation moves focus to the destination h1 on Privacy and back to
  the home h1.
- A 200% root-text stress check retained all visible controls and produced no
  horizontal overflow.
- With reduced motion, scroll behavior is `auto`, tested transitions are
  `0.01ms`, and no animation remains active.
- Supported routes produced no console or page errors. Loading the intentional
  HTTP 404 produces Chromium's expected failed-resource console entry for the
  404 navigation itself; the designed page still has one h1/main and zero Axe
  violations.

All rendered destination links were crawled. Internal routes, checkout,
release download, GitHub Release, and Sociobot returned 200 after redirects;
only the deliberately unknown route returned 404.

## Offline and service worker

**PASS.** After initial `/demo` load, `navigator.serviceWorker.ready` resolved,
`registration.update()` completed, the page was controlled by the active live
`sw.js`, there was no waiting worker, and cache
`diagram-source-studio-v0.1.9` existed. With the browser offline, `/demo`
reloaded with HTTP 200 from the service worker and a new D2 graph rendered
successfully without page errors.

## Performance and bundle budgets

Fresh Lighthouse mobile results for `/`:

| Metric | Result |
| --- | --- |
| Performance | 93 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| LCP | 1.5 s |
| CLS | 0 |
| FCP | 1.4 s |
| Total blocking time | 320 ms |
| Initial transferred weight | 170 KiB |

Build artifacts stay within the supplied budgets:

- main JS: 35.90 KB raw / 12.98 KB gzip;
- CSS: 17.06 KB raw / 4.65 KB gzip;
- four self-hosted fonts: 79.55 KB total;
- mobile hero WebP: 24.90 KB.

## Web deployment identity

**PASS for the web deployment.** I fetched every built file that should be
public and compared it byte-for-byte with the fresh `dist/site` output:
**31 matched, 0 mismatched, 0 fetch failures**. `staticwebapp.config.json` was
correctly excluded because host configuration is not a public asset.

Representative matching SHA-256 values:

| File | SHA-256 |
| --- | --- |
| `index.html` | `36a6988cb96ff17cd924c33a754e07a344386557adce65c2d0b3130a720c144a` |
| `demo.html` | `416835064c2eb8c9c7f79eda058b38c8c2be4eea21a6f30fd6bb2c7436191f1e` |
| `404.html` | `828bfd25890799e81d4fab848eb7aac60f2105d2716706549a6146b6fa32b219` |
| `assets/main-PVLzllni.js` | `f443abb19c3c28a2271e85991a616e7e91fb72ae0c7ccb81b4ef974556340cff` |
| `assets/main-CCC-LUn6.css` | `02882e3b9c8a702daff85bb8f2932acc2fd94062158e36fd40fe9d84f256d541` |
| `sw.js` | `f5b710bda62752c56addbdc697e8d738cbf38720e275523ce9260c8cee188a18` |

`/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route returns
the designed 404 with HTTP 404.

## Billing, allowance, and release artifacts

`npm run test:live:billing` confirmed the production catalog entry at USD
3900, checkout HTTP 303, Dodo host `checkout.dodopayments.com`, and checkout
page HTTP 200.

Forty simultaneous invalid-token requests to the product verification endpoint
produced **30×200 and 10×429**. Every 429 returned `Retry-After: 4` and
`X-RateLimit-After: 4`. The observed single-client burst allowance is 30
requests.

Release `v0.1.9` contains Linux AppImage/deb, Windows MSI/EXE, macOS arm64/x64,
`latest.json`, and `SHA256SUMS`. The downloaded Debian package is version 0.1.9
and its SHA-256
`28bcd799232c046eec81bcd97c3ac9c25f9773ca86fcc16832b2bb027ac9ff5a`
matches the release file. Running the Linux installer against the real latest
release installed an executable 80,587,256-byte AppImage with matching SHA-256
`2d871bb1c2f10b4f243c2a1c74f214a4edccfb58710478960b05821b81793619`
into an isolated temporary directory.

Those assets are internally complete and checksum-valid, but they fail V9-1
because their tag predates the candidate.

## Severity summary

| Severity | Count | Findings |
| --- | ---: | --- |
| Critical | 0 | — |
| High / release-blocking | 1 | V9-1 stale desktop release |
| Medium | 1 | V9-2 undocumented PowerShell test prerequisite |
| Low | 0 | — |

## Retest requirements

1. Document or provision PowerShell, then run `npm ci`, all 21 exact claim
   commands, and `npm test` from a new clean clone; all must exit 0.
2. Publish a new desktop version from the repaired candidate lineage. Confirm
   the tag target and release workflow `head_sha` equal that release commit.
3. Re-download one native package, verify `SHA256SUMS`, and confirm the landing
   page resolves to the new release.
4. Re-run the fresh production build/live byte comparison.
