# Diagram Source Studio repair-2 handoff

## Status

The independent verifier's release blocker from report commit
`540f905dc77e8a4f9c1b83f999746027ec6b7a38` is repaired. Production now lists
`diagram-source-studio` as an enabled $39 USD one-time product, and its checkout
endpoint opens a Dodo-hosted session instead of returning 404.

The repaired static site is live at <https://diagram-source-studio.sociobot.in>.
Native release `v0.1.5` was built from `e74dbec05f04f5ab25255fa5ffe065e065f46958`
and published at <https://github.com/B-Divyesh/sf-diagram-source-studio/releases/tag/v0.1.5>.

## Repair

- Registered and enabled the production Sociobot product with price `3900`
  minor units, currency `USD`, and return URL
  `https://diagram-source-studio.sociobot.in/`.
- Registered the matching pilot product for safe payment-path testing.
- Added `scripts/verify-live-billing.mjs`. It fails when the product is absent
  or has the wrong price, currency, return URL, checkout URL, redirect status,
  HTTPS scheme, Dodo host, or session path.
- Added a regression that first reproduces the verifier's missing-product
  failure against a local billing fixture, then proves the repaired contract.
- Added a checkout-return regression that verifies a returned license is
  stored, verified, removed from the address bar, and reflected in the UI.
- Made live billing verification a prerequisite of every native release build.
- Capped the Playwright suite at two workers so the documented `npm test`
  command stays deterministic on constrained Linux release runners.
- Released version `0.1.5`; its service-worker cache is
  `diagram-source-studio-v0.1.5`.

The researched brief, artifact class, editor behavior, visual system, local
storage model, renderer matrix, and all behavior that previously passed remain
unchanged.

## How to verify

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

- Clean install: 186 packages, 0 vulnerabilities.
- `npm test`: 27/27 tests passed, including the missing-catalog reproduction,
  exact live-contract regression, and checkout-return regression.
- Every one of the 14 `.factory/claims.json` commands passed independently.
- `npm run test:live:billing`: production catalog returned the exact product;
  checkout returned HTTP 303 to `checkout.dodopayments.com/session/...`.
- TypeScript production build passed and produced `dist/site`.
- Initial JS is 34.08 KB raw / 12.44 KB gzip. CSS is 17.01 KB raw /
  4.79 KB gzip. Self-hosted fonts total 79.55 KB.
- npm audit, Rust format, check, tests, and clippy with warnings denied passed.
- `verify-url.sh` passed on live `/` and `/demo`: HTTP 200, correct title,
  language, one H1, main landmark, labels and alt text, with no console errors.
- Live axe scans on `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page` at
  1440×900 and 390×844 found zero serious/critical issues, console errors, or
  horizontal overflow.
- Keyboard pane tabs support Left/Right. Tested controls remain reachable and
  show a 3 px cyan focus outline.
- Live service worker controls the page, uses the v0.1.5 cache, and reloads the
  demo offline. Editing the bundled D2 sample offline still renders a preview.
- Demo mode made no outbound requests. License persistence and checkout return
  are covered in isolated browser contexts.
- Live response policy includes CSP, HSTS, nosniff, strict-origin referrer
  policy, camera/microphone/geolocation denial, immutable hashed assets, and
  rate limiting with `Retry-After` after the allowed verify burst.
- Deployed main-JS SHA256
  `b3a49bcd3b991f187bf66ba6e3df7c5467b6ee3c20586f72534c9882a4b60357`
  matched the local `dist/site` asset.
- Lighthouse 12.8.2 mobile: Performance 99, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.0 s, LCP 2.2 s, TBT 40 ms, CLS 0.008.
- GitHub Actions run `33185433295` passed live billing and all four native
  targets. The release contains arm64/x64 DMGs, AppImage, deb, MSI, EXE,
  `SHA256SUMS`, and `latest.json`.
- Every URL in `latest.json` returned HTTP 200. The Linux AppImage installed by
  the shipped `install.sh` matched its published SHA256; the deb reports
  version 0.1.5 and architecture amd64.
- The live hashed JS is byte-identical to the deployed local build, and the
  release tag resolves to the recorded repair commit.

## Payment smoke-test finding outside this repository

A pilot card payment reached Dodo and succeeded, but the shared Sociobot pilot
gateway did not issue the return license. Its signed `payment.succeeded`
webhook is being retried with:

`Dodo product payment does not match its checkout intent`

The test payment used the correct pilot product and checkout-intent metadata.
Dodo's enabled Adaptive Currency converted the $39 USD price to GBP; the shared
gateway compared the presented GBP amount/currency to the intent's USD fields
and rejected the event. This is a shared `api.sociobot.in` implementation issue,
not code or configuration in Diagram Source Studio. Production catalog identity
and checkout creation are verified; a full payment-to-license assertion cannot
honestly be claimed until the gateway accepts Dodo's localized payments.

Recommended shared-gateway repair: validate the signed webhook's product ID,
business/test-mode identity, checkout session, payment ID, intent metadata, and
successful state. Treat Dodo's supported adaptive-currency presentation as
valid instead of requiring its amount and currency to equal the base catalog
price. Add a fixture where a USD intent settles through a GBP-presented payment,
then replay the retained pilot webhook and verify the return endpoint emits a
license token.

## Known limits

- D2 support remains the deliberately labeled compact nodes/labels/arrows
  subset. Full upstream D2 WASM would materially change the offline package.
- The app preserves UTF-8 BOM and LF/CRLF but does not transcode legacy text
  encodings.
- Unknown SPA paths show the designed 404 view through Azure's navigation
  fallback and therefore return HTTP 200.

## Needs operator action

- Repair the shared Sociobot adaptive-currency webhook validation described
  above, replay the retained pilot event, and verify payment-to-license return.
- Add Apple signing/notarization secrets (`APPLE_CERTIFICATE`,
  `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`,
  `APPLE_PASSWORD`, `APPLE_TEAM_ID`).
- Add Windows signing secrets (`WINDOWS_CERT_PFX`, `WINDOWS_CERT_PASSWORD`).
  Current release artifacts are explicitly labeled unsigned.
