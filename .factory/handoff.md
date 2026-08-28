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
