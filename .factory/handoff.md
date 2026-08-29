# Polish round 1 handoff

## Done

Repaired every finding in adversarial review 1 and deployed repair commit `c1259cf27ebe30112fb07b1d8b4bb0c2bf9eb962` to <https://diagram-source-studio.sociobot.in>.

- Demo is now a true one-click `/?demo=1` sample path with the persistent isolated-data banner, Reset demo, Start for real, shared legal navigation, and shared footer.
- Added `no-sign-in`, `free-editor-diagnostics`, `startup-network`, and `checkout-provider` to `.factory/claims.json`, each with exactly one tagged observable test.
- Rewrote the remaining untestable or overlong public copy, including all four review headings and all four flagged README sentences.
- Preserved the night-market neon workbench identity, responsive panes, and existing desktop/Tauri artifact class.

The full finding-to-evidence mapping is in [polish-1.md](polish-1.md).

## Verification

From a clean local clone at `/tmp/diagram-source-studio-clean.jin7hs`:

- `npm ci` — passed; 186 packages installed; `npm audit --audit-level=high` reported 0 vulnerabilities.
- `npm test` — passed; the accessibility/route suite plus every one of the 21 `.factory/claims.json` commands passed in fresh Playwright processes.
- `npm run build:site` — passed and produced `dist/site/`. Initial JavaScript is 13.10 KB gzip and CSS is 4.63 KB gzip.

Native desktop checks, after installing the exact Linux dependencies from `.github/workflows/release.yml`:

- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` — passed.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml` — passed.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml` — passed (the UTF-8 BOM/CRLF native file round-trip test passed).
- `cargo clippy --locked --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` — passed.

Live verification after deployment:

- `/opt/fleet/lib/deploy-static.sh diagram-source-studio dist/site` — succeeded (deployment `8438f2d5-45b0-4830-8f6c-535e4150f803`); custom-domain HTTPS returned 200.
- `verify-url.sh` passed for the landing page and `/?demo=1`: route-specific title, `lang=en`, one h1, main landmark, image alt text, and zero console/page errors. Evidence: [landing](polish-artifacts-1/live-root/verify.json), [demo](polish-artifacts-1/live-demo/verify.json).
- Cold live interaction confirmed the new first-screen wording, the `/?demo=1` sample flow, banner, reset, Start for real, legal links, and footer. Screenshots: [landing mobile](polish-artifacts-1/live-root/screenshot-mobile.png), [demo mobile](polish-artifacts-1/live-demo/screenshot-mobile.png).
- Live Axe scans at 390 px found zero serious or critical violations on `/`, `/?demo=1`, `/privacy`, and `/terms`.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100. Raw report: [lighthouse.json](polish-artifacts-1/live-root/lighthouse.json).
- `npm run test:live:billing` passed: product price is USD 3900 and the checkout redirects (303) to `checkout.dodopayments.com`, whose hosted page returned 200.

## Known gaps and operator action

There are no unresolved review findings. Desktop release artifacts remain intentionally unsigned until the owner supplies platform signing certificates; the landing page and README disclose this, and release signing is not configured with any secret in this repository.
