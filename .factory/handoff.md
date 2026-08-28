# Diagram Source Studio independent verification 3 handoff

## Status

**FAIL — do not release candidate
`a4cd554c3d5e2cd75842eae3d51078b68a468e94`.**

The live web deployment matches the candidate and the editor, demo, release
assets, installers, offline path, accessibility suite, repository tests, and
live catalog/checkout creation all work. The paid flow is still incomplete:
a fresh Dodo Test Mode payment returned to the product without a `license`
parameter. A buyer therefore cannot receive or verify the advertised Studio
license.

Full evidence and severity are in
[`.factory/verification-3.md`](verification-3.md).

## Verification summary

- All 14 exact `.factory/claims.json` commands passed independently.
- `npm test`: 27/27 passed.
- `npm run build`: passed; TypeScript checked and `dist/site/` produced.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- Rust format, locked check, tests, and clippy with warnings denied passed.
- `npm run test:live:billing`: passed for catalog identity and checkout 303.
- Cold first-read and one-click demo gates passed at desktop and 390px.
- Live Mermaid/D2 editing, diagnostics, recovery, offline reload, and UTF-8
  BOM/CRLF SVG+PNG round trips passed.
- The cited missing-arc case exposed 18 versus 22 edges across the two bundled
  Mermaid renderers.
- Full axe scans found 0 serious/critical issues on five routes at desktop and
  mobile. Two Preview controls are nevertheless only 40px high.
- Three Lighthouse mobile runs scored 82, 90, and 82 performance; all scored
  100 accessibility, best practices, and SEO.
- Live web shell, service worker, main JS, and CSS matched the candidate build
  byte for byte.
- v0.1.5 release URLs all returned 200. The Linux installer and published
  SHA-256 matched; the installed AppImage passed a 15-second smoke test.
- A verify-API burst yielded 30×200 and 30×429, with `Retry-After: 4` on every
  429.

## Defects

- **High / release blocker:** successful pilot payment returns without a
  license token.
- **Medium:** mobile renderer select and Compare button are 40px high, below
  the 44px interaction target.
- **Medium:** Lighthouse performance scored below 90 in two of three fresh
  runs (median 82).
- **Low:** native startup makes two automatic billing-catalog requests not
  clearly disclosed in privacy copy.
- **Low:** unknown routes render the right UI but return HTTP 200.

## Reproduce the main blocker

1. Open
   `https://pilot-api.sociobot.in/api/v1/products/diagram-source-studio/checkout`.
2. Complete Dodo Test Mode with `4242 4242 4242 4242`, a future expiry, and CVC
   123.
3. Observe the redirect to
   `https://diagram-source-studio.sociobot.in/` without `?license=<token>`.

## Commands run

```sh
npm ci
# Every exact test command in .factory/claims.json, separately
npm test
npm run build
npm audit --audit-level=high
npm run test:live:billing
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
cargo clippy --locked --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

The native Rust commands required the same Ubuntu WebKit/GTK packages declared
in `.github/workflows/release.yml`. No product code was changed.

## Needs operator action

- Fix the shared Sociobot gateway's Dodo webhook validation for localized
  settlement currency, replay the retained webhook if available, and verify a
  valid returned license end to end.
- Add Apple signing/notarization secrets (`APPLE_CERTIFICATE`,
  `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`,
  `APPLE_PASSWORD`, `APPLE_TEAM_ID`).
- Add Windows signing secrets (`WINDOWS_CERT_PFX`, `WINDOWS_CERT_PASSWORD`).
  Current release artifacts are correctly disclosed as unsigned.
