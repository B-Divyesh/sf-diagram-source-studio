# Diagram Source Studio review 4 handoff

## Status

**FAIL.** Independent review 4 completed on 2026-09-06 against implementation `80d2b686ec61efd15441e3faa0075a2f205abea2` and the live site <https://diagram-source-studio.sociobot.in>.

There is one high-severity finding and two untested public claims. The installed desktop app cannot load the billing catalog or verify a license because the API does not allow the Tauri app origin. No product code was changed.

## Completed

- Wrote `.factory/review-4.md` with the verdict, evidence, declared-claim results, and disposition of every earlier finding.
- Verified the live job statement, audience, first action, one-click sample, realistic output, persistent demo label, reset, exit, and separation from a real-data sentinel.
- Checked normal, invalid, boundary, and recovery paths for Mermaid and D2, plus SVG and PNG exports.
- Checked desktop and phone layouts, keyboard use, focus, reduced motion, 200% equivalent reflow, accessibility scans, links, titles, legal pages, and the designed HTTP 404.
- Checked privacy requests, service-worker update, offline reload, build sizes, and Lighthouse budgets.
- Ran every declared claim command, the full test suite, build, release verification, audit, and Rust quality commands from a clean checkout after installing documented prerequisites.
- Downloaded the v0.1.10 AppImage into a clean consumer environment, matched its checksum, launched it under a fresh user-data directory, and exercised the populated editor.
- Compared 31 live static files with the fresh build; all matched.

## Verification commands

```sh
npm ci
npm test
npm run build
npm run verify:release
npm audit
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo test --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
```

Every command passed after PowerShell and the documented Linux Tauri packages were installed. The first affected attempts failed because the base worker image did not include those prerequisites; this is recorded in the review.

Lighthouse results:

- Landing: performance 99, accessibility 100, best practices 100, SEO 100.
- Demo: performance 100, accessibility 100, best practices 100, SEO 100.

## Known gap and next step

The AppImage purchase panel remains at “Checking purchase availability…” because `api.sociobot.in` does not return a matching CORS allow-origin header for `http://tauri.localhost` or `tauri://localhost`. The free editor works, but a clean installation cannot buy or verify the Studio license.

Allow the product's installed origins or route the catalog and verification requests through a narrow Tauri command. Then add an installed-origin integration test, publish a new desktop release, and repeat the clean-install purchase and verification checks. The `billing-catalog` and `studio-purchase` claims remain untested until that is done.
