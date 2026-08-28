# Independent product verification 3 — FAIL

Verified on 2026-08-28 against candidate commit
`a4cd554c3d5e2cd75842eae3d51078b68a468e94` and
<https://diagram-source-studio.sociobot.in>.

## Verdict

**FAIL — do not release.** The editor, demo, documented claim suite, native
packages, live catalog, and checkout creation work. A fresh Dodo Test Mode
purchase still returned to the product without a license token, so a buyer
cannot receive the advertised Studio comparison. This is an end-to-end release
blocker even though the failing component is the shared Sociobot billing
gateway rather than this repository.

## Release-blocking finding

### High — successful checkout does not deliver a license

I independently exercised the permitted pilot path rather than relying on the
builder's previous report:

1. `GET https://pilot-api.sociobot.in/api/v1/products` listed
   `diagram-source-studio` at 3900 USD minor units.
2. Its checkout endpoint returned HTTP 303 to
   `https://test.checkout.dodopayments.com/session/...`.
3. I completed Dodo Test Mode with card `4242 4242 4242 4242`, future expiry,
   CVC 123, and a fresh test customer.
4. Dodo accepted the payment and redirected to
   `https://diagram-source-studio.sociobot.in/`.
5. The final URL had no `license` query parameter (`hasLicense: false`). No
   token was therefore available to store, verify, paste into the desktop app,
   or use to enable the renderer matrix.

Production registration itself is repaired: the exact $39 USD product is in
the live catalog and its checkout responds 303 to
`checkout.dodopayments.com/session/...`. That does not complete the required
payment → return token → verification → paid feature flow.

The builder's handoff identifies an adaptive-currency mismatch in the shared
gateway's signed-webhook validation. Fresh end-to-end evidence confirms that
the externally owned blocker remains active.

## First-read and demo gates — PASS

Cold live loads at 1440×900 and 390×844 answer the required questions in plain
words:

- **What it does:** “Catch broken diagram renders before commit.”
- **For whom:** engineers who keep Mermaid or D2 files in Git and need to
  inspect real output.
- **What to click:** “Try it with sample data,” captioned “Loads a Mermaid
  project in the browser.”

The action is visible without scrolling at both sizes. At 1366×768 its box is
`y=520.1..572.0`; all three fact lines end at `y=710.2`. One click opens
`/demo`, which immediately has the sample source, render, persistent “Demo —
sample data, nothing is saved” banner, **Reset demo**, and **Start for real**.

## Claims gate — PASS

`.factory/claims.json` exists. From the clean candidate checkout I ran `npm ci`
and then every exact command in the manifest separately. Each command selected
exactly one tagged test and passed:

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS — 1 passed |
| `private-local` | PASS — 1 passed |
| `editable-export` | PASS — 1 passed |
| `renderer-matrix` | PASS — 1 passed |
| `d2-preview` | PASS — 1 passed |
| `offline-core` | PASS — 1 passed |
| `license-enforcement` | PASS — 1 passed |
| `native-file-dialogs` | PASS — 1 passed |
| `offline-reference` | PASS — 1 passed |
| `safe-svg` | PASS — 1 passed |
| `no-tracking` | PASS — 1 passed |
| `unsigned-builds` | PASS — 1 passed |
| `release-installers` | PASS — 1 passed |
| `studio-purchase` | PASS — 1 passed |

The `studio-purchase` claim proves the price, catalog entry, and checkout URL;
it uses a recorded catalog response and does not prove that a completed payment
issues a license. The live failure above therefore remains release-blocking.

## Repository and native gates

| Check | Independent result |
| --- | --- |
| Clean identity | PASS — initial tree clean at the exact candidate SHA |
| `npm ci` | PASS — 186 packages installed; 0 vulnerabilities |
| `npm test` | PASS — 27/27 Playwright tests |
| `npm run build` | PASS — TypeScript `--noEmit` and Vite production build; `dist/site/` produced |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo check --locked --manifest-path src-tauri/Cargo.toml` | PASS after installing the exact Ubuntu packages from the release workflow |
| `cargo test --locked --manifest-path src-tauri/Cargo.toml` | PASS — 0 Rust tests exist |
| `cargo clippy --locked --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` | PASS |
| `npm run test:live:billing` | PASS — exact product, price, currency, return URL, and Dodo checkout redirect |

No separate npm lint script exists; TypeScript checking is part of the exact
production build.

## Core product exercise — PASS

- The live bundled Mermaid sample renders with a success diagnostic.
- Empty input and malformed Mermaid source produce specific errors and a
  keyboard-operable **Load working sample** recovery.
- Compact D2 renders nodes, Unicode labels, arrows, and an edge label. An
  unsupported line produces a numbered warning; input with no nodes produces a
  recovery error.
- A UTF-8 source containing a BOM, CRLF line endings, `Café`, and `☕` was
  exported to both SVG and PNG. Decoded metadata matched every original byte.
  Reopening the SVG restored the editable source.
- Reset restored the Mermaid sample. Blank and invalid license input failed
  closed with useful feedback. Demo local storage remained empty.
- A 22-edge graph derived from the Mermaid issue cited in the research rendered
  18 edges in bundled Mermaid 11.17.2 (labels 6, 7, 11, and 12 missing) and all
  22 in 10.9.8. The matrix displayed both and announced “Renderer outputs
  differ,” directly exercising the researched job-to-be-done.
- The direct demo edit/render/export flow made no unsolicited cross-origin
  request and produced no console or page error. Its only cross-origin request
  occurred after I explicitly submitted an invalid test license.
- A simulated real/native workspace persisted source only under
  `real:diagram-source-studio:document`; demo mode never wrote that namespace or
  an `sb_license:*` key.

No sign-in exists, so Entra authority validation is not applicable. AI is an
explicit non-goal and there is no missed AI leverage for the core verification
job.

## Release and installability — PASS with provenance note

- GitHub release `v0.1.5` contains arm64 and x64 DMGs, MSI, EXE, AppImage, deb,
  `SHA256SUMS`, and `latest.json`.
- Every one of the five platform URLs in `latest.json` returned HTTP 200.
- Running `public/install.sh` in a fresh temporary destination installed an
  executable 80,583,160-byte AppImage. Its SHA-256 was
  `2f824bc92116e1cf09bdd26cb75319b689568c9ec73e6c2f70c2242013c012d4`,
  exactly matching `SHA256SUMS`.
- The installed AppImage stayed alive for a 15-second Xvfb smoke test. The
  worker emitted only headless EGL and missing GStreamer `appsink` warnings.
- The downloaded deb checksum matched
  `ef84ef2d177a76a29d1ab6279c92484a7dcc238d8c7f2bdfd54604eacc242898`;
  package metadata reports version 0.1.5, amd64.
- The release tag peels to `e74dbec05f04f5ab25255fa5ffe065e065f46958`,
  not the candidate. The intervening candidate diff contains only README,
  Playwright worker configuration, and factory handoff changes; runtime,
  packaging, and release-workflow source are unchanged.

## Deployment identity — PASS

The live web deployment matches the exact candidate build byte for byte:

| File | SHA-256 | Match |
| --- | --- | --- |
| `index.html` | `a265621a7997d1d90c7626ba897c8a56cfc00f62a271b80df502f4b90bb63c8d` | yes |
| `sw.js` | `07f2a0eef4fe2f2b5245112ba65bb6424c09f5c472750792aa9de45b3a6e5baf` | yes |
| main JS | `b3a49bcd3b991f187bf66ba6e3df7c5467b6ee3c20586f72534c9882a4b60357` | yes |
| main CSS | `a9729285c7beb09b2fb207ebb00e20fb9b738f6dbb59bbc7d080745efceed7e2` | yes |

## Accessibility, keyboard, and responsive QA

- Full, unfiltered axe scans on `/`, `/demo`, `/privacy`, `/terms`, and
  `/missing-page` at 1440×900 and 390×844 found **0 serious/critical findings**
  and 0 findings overall.
- Every route has `lang=en`, one `h1`, one `main`, a route-specific title, no
  horizontal overflow, and no console/page errors.
- `/opt/fleet/lib/verify-url.sh` passed on `/` and `/demo`: title, language,
  landmarks, labels, alt text, and console checks all passed.
- Keyboard traversal reaches the editor actions, language selector, pane tabs,
  and source editor without a trap. Left/Right changes pane tabs and their
  `aria-selected` state. Route navigation and browser Back focus the new `h1`
  and update the polite announcement. Focus is a visible 3px cyan ring; the
  source editor uses an equivalent inset ring.
- Reduced-motion emulation reduces maximum animation and transition duration
  to 0.01ms.

### Medium — two mobile preview controls miss the 44px target minimum

At 390px, after opening the Preview pane, the renderer-version select measured
130×40px and **Compare versions** measured 174×40px. All other visible measured
controls were at least 44px high. The repository touch-target test checks only
navigation and demo-banner actions, so it does not catch these two controls.

## Performance

Static budgets pass: initial JS is 34.08KB raw / 12.44KB gzip, CSS is 17.01KB
raw / 4.79KB gzip, self-hosted fonts total 79.55KB, and the mobile hero is
24.9KB. Lighthouse reports a 159KiB total first load, zero CLS, and no
third-party main-thread blocking.

### Medium — Lighthouse performance is below the required score in two of three runs

Three fresh Lighthouse 12.8.2 mobile runs scored **82, 90, and 82** for
performance (median 82), while accessibility, best practices, and SEO were 100
in every run. LCP was 1.6s, 1.5s, and 2.8s; TBT was 720ms, 390ms, and 550ms.
There were no run warnings. The candidate therefore does not reliably meet the
required Lighthouse performance score of at least 90, despite passing the
static bundle budgets.

## Privacy, network, response policy, and PWA

- HTTPS responses include HSTS, `nosniff`, strict-origin referrer policy,
  camera/microphone/geolocation denial, and a CSP with
  `frame-ancestors 'none'`. The verification endpoint allows only the deployed
  origin in the tested CORS response and sends `Cache-Control: no-store`.
- Hashed assets and bundled renderer scripts use one-year immutable caching;
  documents and `sw.js` use a 30-second revalidation policy.
- The service worker was active and controlling `/demo`, used cache
  `diagram-source-studio-v0.1.5`, had no waiting worker after `update()`, and
  reloaded `/demo` offline. A new D2 diagram rendered successfully offline.
- A 60-request concurrent burst to the product verification endpoint yielded
  30 HTTP 200 and 30 HTTP 429 responses. Every 429 included `Retry-After: 4`.
  The observed concurrent allowance was 30; completion order means there is no
  meaningful serial “first request” in that burst.
- I crawled 42 rendered links (15 unique destinations) across the five routes;
  no destination was dead. GitHub asset navigation returned its expected 302,
  and checkout returned its expected 303.

### Low — native startup makes two undisclosed catalog requests

In a fresh simulated native shell with no license token, startup made two
automatic `GET https://api.sociobot.in/api/v1/products` requests. The second is
caused by the immediate license-state refresh. No diagram content or identifier
was sent, but the privacy page discloses license verification and GitHub release
metadata, not this automatic duplicate billing-catalog access. The README's
statement that the only optional app request sends an entered license token is
also narrower than observed behavior. Disclose/test the catalog fetch and avoid
the duplicate request.

### Low — designed not-found screen returns HTTP 200

`/missing-page` renders the correct not-found UI but the live server responds
HTTP 200. This does not satisfy the site-structure requirement for a real 404
response and can mislead crawlers and monitors.

## Required next steps

1. Repair the shared gateway's successful-payment validation, replay or repeat
   the test transaction, and prove that the return URL contains a valid token
   accepted by the product verification endpoint.
2. Raise both mobile preview controls to at least 44px.
3. Make Lighthouse mobile performance reliably reach 90 or better.
4. Disclose and deduplicate native billing-catalog requests.
5. Configure the host to return HTTP 404 for unknown routes while serving the
   designed 404 page.

No product code was modified during this verification.
