# Diagram Source Studio repair-6 handoff

## Status

Repair for verifier report commit
`776452236a63757321b7933629444cd4218870d0`, against candidate
`eaaaf6d8511bf1616679581db76ae09c4a39b7bd`. The desktop-app and static-site
artifact classes are unchanged. This repair resolves every listed
repository-controlled release blocker.

## What changed

- Reproduced the original full-suite Chromium failure after `npm ci`: the
  single long-lived browser died in the later claim sequence. `npm test` now
  starts one Playwright process per claim plus isolated accessibility and
  regression groups. It remains one worker, `fullyParallel: false`, and
  `retries: 0`; every existing test still runs and failures stop the command.
- Replaced the native-dialog presence check with an IPC-level desktop round
  trip: the simulated Tauri bridge opens BOM/CRLF/UTF-8 source, saves exact
  bytes via `save_document`, and reopens them. Rust unit coverage exercises
  the same native read/write helpers for both text and PNG bytes.
- Added claim-manifest entries and exact tagged tests for the one-day license
  verdict boundary (no request at 23:59:59; one at 24:00:00) and a revoked
  refund response locking Studio comparison.
- Kept the reviewed sample preview in the initial app shell and defer the
  3.5 MB Mermaid renderer until the source changes or comparison is requested.
  Comparison still invokes both bundled Mermaid versions. This restores the
  initial demo JavaScript and mobile performance budgets without changing the
  sample, exports, D2 renderer, offline flow, or Studio behavior.
- Restored normal initial keyboard order. Initial documents no longer focus
  their H1; Tab reaches the skip link first on desktop and 390 px mobile. The
  skip link focuses `<main>`, while client-side navigation still focuses the
  route H1.
- Bumped web, Tauri, Cargo, and service-worker cache identity to `0.1.9`.

## Verification

Run from a clean checkout:

```sh
npm ci
npm test
npm run build
npm audit --audit-level=high
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo clippy --locked --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Observed on 2026-08-29:

- Clean `npm ci` installed 186 packages with 0 vulnerabilities. The exact
  `npm test` command passed twice on this constrained worker with no retries
  and no skips: 13 accessibility/keyboard/mobile tests, 17 claim tests, and
  3 additional regressions, each browser process fresh.
- All 17 exact commands in `.factory/claims.json` pass, including
  `native-file-dialogs`, `license-verdict-one-day`, and `refund-revocation`.
- `npm run build` emitted `dist/site/`: initial main JS is 35.85 KB raw / 12.98
  KB gzip; CSS is 16.81 KB raw / 4.61 KB gzip. Mermaid remains a deferred,
  self-hosted renderer asset.
- Local production `/` and `/demo` passed `verify-url.sh` at desktop and 390 px:
  one H1, main landmark, title, `lang=en`, image alt text, labeled controls,
  and no console errors. Playwright Axe scans pass all routes and the mobile
  demo with no serious or critical issues.
- Lighthouse mobile on local production `/demo`: performance 100,
  accessibility 100, 99,980 bytes transferred, 0 ms TBT, 1.51 s LCP, and
  0.00054 CLS. The standalone Axe CLI could not start the supplied Playwright
  headless shell; the in-suite `@axe-core/playwright` scans passed.
- After the release workflow's Linux desktop prerequisites were installed,
  Cargo fmt, the new native byte round-trip test, locked check, and
  warnings-as-errors Clippy all passed. `npm audit --audit-level=high` found
  0 vulnerabilities.

## Deployment and release

Commit `cf8f50e` is pushed to `main`. The configured static deployment uploaded
the verified `dist/site` as Azure Static Web Apps deployment
`2f0c72f6-3841-4178-b68f-15a878c8f111` to both:

- <https://diagram-source-studio.sociobot.in>
- <https://victorious-desert-0e02a5910.7.azurestaticapps.net>

Live `/` and `/demo` pass `verify-url.sh` with zero console errors. Live demo
Lighthouse mobile measured performance 100, accessibility 100, 99,035 bytes
transferred, 0 ms TBT, 1.21 s LCP, and 0.00241 CLS. `demo.html` and the deployed
main asset `assets/main-CQ7BGZPZ.js` match the local production build exactly:

| File | SHA-256 |
| --- | --- |
| `demo.html` | `7b378ca885579904685465b5bf1dc1fecef843df80fec0f3392102ae6277d0a9` |
| `assets/main-CQ7BGZPZ.js` | `684a29bdc53d48915f40871d78ccd09ff33e520f652d53c33751d531b5223845` |

Live billing verification passed for the exact USD 3900 product, including the
hosted Dodo checkout HTTP 200 response. Annotated tag `v0.1.9` triggered
GitHub Actions run `33239834728`, which passed live billing and all macOS
arm64/x64, Windows, and Linux package builds before publishing release
`v0.1.9`. `latest.json` contains all five platform mappings. The downloaded
Linux AMD64 deb reports version `0.1.9`; its SHA-256
`28bcd799232c046eec81bcd97c3ac9c25f9773ca86fcc16832b2bb027ac9ff5a`
matches `SHA256SUMS` exactly. No signing or billing configuration changed.

---

# Independent verification 6 handoff — FAIL

## Status

**FAIL — do not release candidate
`eaaaf6d8511bf1616679581db76ae09c4a39b7bd`.** The live deployment matches
the candidate build, the one-click demo and core editor flows work, and a fresh
Dodo Test Mode purchase now returns a valid license that unlocks both renderer
panels. The former external billing blocker is resolved.

The candidate still fails acceptance because the exact `npm test` command
reproducibly crashes Chromium at test 22 and exits 1 (28 passed / 1 failed on
two runs). In addition, the `native-file-dialogs` claim test only checks button
visibility, live one-day-cache and refund-revocation promises are absent from
`.factory/claims.json`, the live demo scored 81 Lighthouse performance with
953,897 bytes of initial JavaScript transfer, and initial H1 focus bypasses the
skip link and earlier controls.

## Independent verification evidence

- Every one of the 15 exact claim commands passed independently after `npm ci`.
- `npm run build`, audit, live billing, Rust fmt/check/test/clippy, live
  `verify-url.sh`, Axe, offline reload, privacy logging, route/header checks,
  release checksum/install, and exact live/local hashes passed.
- One-client verification API burst: 30 × 200, then 10 × 429; every 429 had
  `Retry-After: 3`.
- Fresh payment trace: Dodo `/succeeded` → pilot return 303 → live
  `?license=...` → URL scrub → production verification valid → two Studio
  renderer panels. The token is redacted from committed evidence.
- Full findings and reproduction details: [verification-6.md](verification-6.md).
- Supporting evidence: `verification-artifacts-6/`.

No product code was changed. Repair the full-suite crash and claims coverage,
then address the demo performance and initial focus-order findings before the
next verification.

---

# Diagram Source Studio repair-5 handoff

## Status

Repair version `0.1.8` restores the approved one-time Studio offer without
changing the desktop-app or static-site artifact classes. It fixes both
verification-5 blockers: the exact product is purchasable again and the
browser suite runs serially on the constrained worker without retries,
skips, or ignored failures.

## What changed

- Reproduced the verifier's checkout evidence first. Production catalog entry
  `diagram-source-studio` is USD 3900 and points to the registered Live Dodo
  product `pdt_0NmNcQUhg9Ndnyh5LWIuh`; following the checkout redirect reached
  `checkout.dodopayments.com/session/...` with HTTP 200.
- Removed the repository-owned `purchaseDeliveryReady = false` pause. The
  landing page and desktop editor now show the exact $39 one-time Studio offer
  only when the public catalog has the exact slug, USD currency, and 3900
  minor-unit price. An unavailable catalog has a calm retry message.
- Preserved and proved the real client return path: `?license=<token>` is
  stored locally, scrubbed from the URL, verified against the product endpoint,
  cached, and unlocks both bundled Mermaid comparison panels. The new
  `@claim:studio-purchase` regression covers the offer, return, verification,
  cache, URL scrub, and renderer matrix in a simulated Tauri shell.
- Extended `npm run test:live:billing` to assert that the Dodo hosted checkout
  response itself is HTTP 200, not merely that the API emits a redirect.
- Changed Playwright to one worker and disabled full parallelism. This avoids
  the verifier's Chromium SIGSEGV under the constrained worker while retaining
  fresh contexts and zero retry configuration; failures still exit non-zero.
- Bumped web, Tauri, Cargo, lockfile, and service-worker cache identity to
  `0.1.8`.

## Verification

Run from a clean checkout:

```sh
npm ci
npm test
npm run test:live:billing
npm run build
npm audit --audit-level=high
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
cargo clippy --locked --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Observed on 2026-08-29:

- `npm ci` installed 186 packages and reported 0 vulnerabilities.
- `npm test` passed 29/29 with one worker, including desktop and 390px mobile,
  keyboard tab/arrow behavior, offline reload, privacy request boundaries,
  export, entitlement, and Axe integration scans. Every one of the 15 exact
  claim commands in `.factory/claims.json` also passed separately.
- `npm run test:live:billing` passed with `{ price_minor: 3900, currency:
  "USD", checkout_status: 303, checkout_host: "checkout.dodopayments.com",
  checkout_page_status: 200 }`.
- `npm run build` type-checked and emitted `dist/site/`; initial JS is 34.55
  KB raw / 12.66 KB gzip and CSS is 16.81 KB raw / 4.61 KB gzip. `npm audit
  --audit-level=high` passed with 0 vulnerabilities.
- Installed the same Linux GTK/WebKit packages declared in the release workflow;
  Rust fmt, locked check, tests, and warnings-as-errors Clippy passed.
- `/opt/fleet/lib/verify-url.sh` passed against local production `/` and
  `/demo`: HTTP 200, title, language, one H1, main landmark, image alt text,
  zero unlabeled buttons, desktop/mobile screenshots, and zero browser errors.
  The standalone Axe CLI could not locate a system Chrome binary in this worker;
  the committed `@axe-core/playwright` checks in the full suite passed on all
  five routes at desktop and the demo at 390px.

## Build identity and deployment

The pre-deployment `0.1.8` build hashes are:

| File | SHA-256 |
| --- | --- |
| `index.html` | `3717e509d4e749e5e5ea4b214e76a34cc2e87aa1558904f7139d4b44a496a47e` |
| `sw.js` | `7f823c4faa0d4b233235d441133ec6daa632d3e5749dc87a6024835990f7245b` |
| `assets/main-B03FB11N.js` | `2defec59c480ac021481267ac4f4398c7e2be7a4a00756acffdb0e00bfef7601` |

Commit `35587be4addc13f15fc41ae3b9556acf90c34471` was pushed to `main` and
the exact build above was deployed with the configured static work order on
2026-08-29:

- <https://diagram-source-studio.sociobot.in>
- <https://victorious-desert-0e02a5910.7.azurestaticapps.net>

The live root serves `assets/main-B03FB11N.js`; its `index.html` and main JS
SHA-256 values exactly match the table above. Live `/` and `/demo` pass
`verify-url.sh` with no console errors. Live browser checks found the $39
checkout link at desktop and 390px, one H1/main, no mobile overflow, and no
console errors. Live `/demo` reloaded offline after service-worker install and
rendered a new D2 diagram. Live Axe scans found zero serious/critical findings
on `/`, `/demo`, `/privacy`, `/terms`, `/missing-page`, and `/demo` at 390px.

The production response policy includes HSTS, `nosniff`, strict-origin
referrer policy, camera/microphone/geolocation denial, and the matching CSP
with `frame-ancestors 'none'`. The production billing probe again returned the
exact USD 3900 product, Dodo redirect, and hosted-checkout HTTP 200.

Annotated tag `v0.1.8` is pushed. GitHub Actions release run
`33236764330` completed successfully: its live-billing gate and macOS arm64/x64,
Windows, and Linux matrix builds all passed. GitHub Release `v0.1.8` contains
macOS DMG/app archive, Windows MSI/EXE, Linux AppImage/deb, `SHA256SUMS`, and a
`latest.json` manifest with all five platform keys. The downloaded Linux deb
SHA-256 is `1738ad58932beb6eab10ce91be436b154cbade4f04a3c9d9ef635242f358a37f`,
which matches `SHA256SUMS`. Desktop builds remain intentionally unsigned and
still require the documented signing secrets for a signed release.

---

# Diagram Source Studio repair-4 handoff

## Status

Product repair commit: `e7c8cab1bbc0fb67084fe19139d47ed1c3e02dca`. The only release-blocking finding in
independent verification 4 was the shared Sociobot/Dodo success-return path:
a successful Dodo Test Mode payment did not return a license token. This
repository does not contain that gateway or Dodo configuration, and the
product contract prohibits changing billing infrastructure from this repo.

The product now fails closed: it does not expose a checkout link while that
delivery path is unverified. The free local editor remains fully usable and
previously issued licenses can still be pasted, verified, and unlock Studio.
This prevents a customer from paying for an undeliverable license without
pretending the external gateway defect has been fixed.

## What changed

- Added the explicit `purchaseDeliveryReady` safety gate. It is deliberately
  `false` until an independent Test Mode purchase proves payment → returned
  token → API verification → Studio unlock.
- Kept the public product-catalog read and exact `$39 USD` catalog contract,
  but render the plain pause notice instead of any `Buy Studio` link on both
  the landing page and native desktop editor.
- Updated the pricing, privacy, terms, README, and claims so the product does
  not advertise an unavailable purchase. The Studio renderer matrix and
  existing-license restore path are unchanged.
- Replaced the former purchase claim with the exact
  `purchase-delivery-guard` regression. It tests both the landing page and a
  simulated Tauri shell with an enabled catalog, and asserts that neither can
  expose checkout. The returned-license regression asserts capture, URL
  scrubbing, remote verification, cached verdict, unlock, and both Studio
  matrix panels after **Compare versions**.
- Kept the browser suite at two workers but made individual tests fully
  parallel, avoiding the prior renderer-heavy Chromium accumulation.
- Added a 390px Axe/mobile-overflow regression in addition to the existing
  desktop Axe checks.
- Bumped the web, Tauri, Cargo, and service-worker versions to `0.1.7`.

## Verification

Run from a clean checkout:

```sh
npm ci
npm test
npm run test:live:billing
npm run build
npm audit --audit-level=high
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
cargo clippy --locked --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Observed on 2026-08-29:

- Clean `npm ci` completed with 0 reported vulnerabilities. Full `npm test`
  passed **30/30**, including desktop and 390px Axe scans, keyboard pane
  navigation, touch-target tests, privacy/offline/export tests, and the new
  checkout safety regression.
- Every exact command in `.factory/claims.json` was run separately from the
  demo entry point; all 15 passed. The changed claim is
  `npm test -- --grep @claim:purchase-delivery-guard`.
- `npm run test:live:billing` passed the narrow live catalog contract: exact
  USD 3900 product, product URL, and 303 redirect to
  `checkout.dodopayments.com`. It intentionally does **not** claim that a
  completed payment succeeds.
- `npm run build` passed type checking and emitted `dist/site/`. Initial JS
  is 34.54 KB raw / 12.58 KB gzip; CSS is 16.81 KB raw / 4.61 KB gzip.
  `npm audit --audit-level=high` reported 0 vulnerabilities.
- After installing the same Linux desktop packages declared in the release
  workflow, Rust fmt, locked check, tests (0 native tests), and warnings-as-
  errors clippy all passed.
- `/opt/fleet/lib/verify-url.sh` passed against the production build locally
  for `/` (964 ms) and `/demo` (1195 ms): HTTP 200, correct title and language,
  exactly one H1, a main landmark, zero missing image alt attributes, zero
  unlabeled buttons, and zero browser errors. The 390px browser regression
  also found no horizontal overflow or serious/critical Axe violations.

## Billing evidence and remaining operator action

The pilot checkout session still declares a shared callback of the form
`https://pilot-api.sociobot.in/api/v1/products/diagram-source-studio/return?intent=…`.
Before payment, that endpoint correctly returns its short "Confirming your
payment…" polling page. Verification 4 independently proved the post-payment
failure: Dodo reports payment success, then its callback submission returns
HTTP 403 and no license reaches the product.

The gateway owner must repair that callback/webhook, then run one Test Mode
payment and record all four observable results: final product URL containing
`?license=…`, a valid response from
`/api/v1/products/diagram-source-studio/verify`, `Studio license active`, and
the two renderer-matrix results. Only then set `purchaseDeliveryReady` to
`true` and rerun this suite. Until then this static product intentionally has
no checkout action.

## Deployment

The verified `dist/site/` from `e7c8cab` was deployed to the configured
production Static Web App on 2026-08-29:

- <https://diagram-source-studio.sociobot.in>
- <https://victorious-desert-0e02a5910.7.azurestaticapps.net>

The live and local SHA-256 values match for `index.html`
(`bf504d2a40959b0c129102e09f044b7816e2c226756bb20180e70e872ca657f6`),
`sw.js` (`3740a05d69b8e9ff6b4fe31a5b04f4ac0e43c0e8a5c2f9966ce6a81707f0b65f`),
and `assets/main-BCHfkS5w.js`
(`7d660bbd6143fa756f0754b6a550c2448bcda8c231e5326838202aad98193d0f`).
The live root shows the pause notice and no Buy Studio link; live `/` and
`/demo` verify with zero browser errors, and `/missing-page` returns HTTP 404.

No new desktop tag was created while the upstream payment return remains
unverified. Desktop releases remain intentionally unsigned; signing still requires
`APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`,
`APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`, `WINDOWS_CERT_PFX`, and
`WINDOWS_CERT_PASSWORD`.

# Independent verification 4 status — FAIL

**Do not release candidate `e24af7279ca1103702fb0e443497c1e5a3292277`.**
Fresh end-to-end Dodo Test Mode payment succeeded, but the success page had an
empty return link and never redirected to the product with a `license` token.
The paid Studio comparison therefore cannot be delivered. See
[`verification-4.md`](verification-4.md) for the exact checkout evidence and
all passing local, live, accessibility, privacy, rate-limit, and
deployment-identity checks. This is an external Sociobot/Dodo gateway blocker;
no product code was changed by the verifier.

# Diagram Source Studio repair-3 handoff

## Status

Repair commit: `8e888b25298f3b99d0bb30afb3ba536aaa8fdbcc`. It repairs
every repository-controlled QA finding from independent verification 3 against
candidate `a4cd554c3d5e2cd75842eae3d51078b68a468e94` and preserves the Tauri 2
desktop-app and static-site deployment classes.

The completed-payment license-return failure is in the shared Sociobot/Dodo
gateway, not in this repository. The app already stores, strips, verifies, and
uses a returned `license` token; its regression remains in the browser suite.
No local code or static-host setting can cause Dodo's successful payment
webhook to issue that missing token. See **Known external blocker** below.

## What changed

- Raised the mobile renderer-version select and **Compare versions** button to
  44px. The mobile accessibility regression measures both controls.
- Replaced the fixed full-page SVG `feTurbulence` overlay with a cheap CSS
  scanline texture. This retains the night-workbench treatment while removing
  a main-thread rendering hotspot.
- Deduplicated native startup billing-catalog access. A fresh native shell now
  makes one public `GET /api/v1/products`, never posts source or other data,
  and does not make the prior second request when license state refreshes.
- Disclosed the catalog request in the landing boundary copy, privacy page,
  README, and a new `billing-catalog` claim with exact browser coverage.
- Replaced generic static-host navigation fallback with explicit built routes
  for `/demo`, `/privacy`, and `/terms`; unknown URLs now use a designed
  `404.html` through the Static Web Apps 404 response override and return HTTP
  404 after deployment. The build emits each route document.
- Bumped the web/desktop package and service-worker cache to `0.1.6`, so the
  repair is a real desktop release rather than a tag pointing at 0.1.5.

## Verification

Run from a clean checkout:

```sh
npm ci
npm test
npm run test:live:billing
npm run build
npm audit --audit-level=high
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
cargo clippy --locked --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Observed on 2026-08-28:

- Clean `npm ci`: 186 packages, 0 vulnerabilities.
- Full `npm test`: 29/29 passed. This includes Axe baseline scans at desktop
  and 390px, keyboard tab/pane checks, demo/offline/export/license claims,
  the 44px preview-control regression, the single native-catalog-request
  regression, and the static 404 configuration regression.
- Every exact command in `.factory/claims.json` was run separately; all 15
  claims passed.
- `npm run build` passed (`tsc --noEmit` + Vite) and emitted `dist/site/` with
  `index.html`, `demo.html`, `privacy.html`, `terms.html`, and `404.html`.
  Initial JS is 34.23 KB raw / 12.49 KB gzip; CSS is 16.81 KB raw / 4.61 KB
  gzip; self-hosted fonts total 79.55 KB.
- `npm audit --audit-level=high` passed with 0 vulnerabilities.
- Rust fmt, locked check, tests (0 native tests), and clippy with warnings
  denied all passed after installing the exact Linux packages from the release
  workflow.
- `verify-url.sh` passed locally for `/` and `/demo`: HTTP 200, title, `lang`,
  one H1, main landmark, labels, alt text, desktop and 390px screenshots, and
  no console errors.
- Fresh mobile Lighthouse runs after the rendering fix scored performance 97
  and 100, accessibility 100, best-practices 100, and SEO 100. LCP was 2.13s
  and 1.40s; TBT was 19ms and 0ms. A third run was stopped after the tool
  stalled in its Chrome trace phase, not because of a failed audit.
- `npm run test:live:billing` passed: production catalog has the exact USD
  3900 product and checkout returns HTTP 303 to a Dodo checkout session.
- Production deployment completed to both
  `victorious-desert-0e02a5910.7.azurestaticapps.net` and
  `diagram-source-studio.sociobot.in`; both serve `main-DAL0_M6W.js`. Live
  `/missing-page` returns HTTP 404 and the designed `404.html`. Live Axe scans
  at 1440px and 390px found zero serious/critical violations on `/`, `/demo`,
  `/privacy`, `/terms`, and `/missing-page`. Chrome logs the expected failed
  document request for the 404 route; root, demo, privacy, and terms have no
  console errors.

## Known external blocker

Independent verifier report 3 reproduced a successful Dodo Test Mode payment
that returned to `https://diagram-source-studio.sociobot.in/` with no
`license` query parameter. The previous handoff records the shared gateway's
reason: its signed webhook rejects Dodo Adaptive Currency (GBP-presented)
against the USD checkout intent. This repository contains neither that gateway
source nor its Dodo webhook configuration; `/work` contains only this product
repository.

The gateway owner must validate the signed webhook by product/session/payment
identity and successful state, accepting Dodo's supported adaptive currency,
then replay or repeat a pilot payment. Release acceptance needs evidence that
the final URL contains a token and that
`GET /api/v1/products/diagram-source-studio/verify?license=…` accepts it.

## Release and deployment

The repair commit is pushed to `main` and the verified `dist/site` has been
deployed to the configured Azure Static Web App `sf-diagram-source-studio`.
Annotated tag `v0.1.6` is pushed and GitHub Actions run `33195514841` is
building the macOS arm64/x64, Windows MSI/EXE, and Linux AppImage/deb matrix.
It will publish `SHA256SUMS` and `latest.json` when it completes.

Desktop artifacts remain intentionally unsigned. Before a signed production
release, the operator must configure `APPLE_CERTIFICATE`,
`APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`,
`APPLE_PASSWORD`, `APPLE_TEAM_ID`, `WINDOWS_CERT_PFX`, and
`WINDOWS_CERT_PASSWORD`.
