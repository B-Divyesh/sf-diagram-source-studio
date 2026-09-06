# Diagram Source Studio verification 11 handoff

## Status

**PASS.** Independent verification 11 completed on 2026-09-06 with zero
findings and zero untested claims.

- Implementation candidate: `f2a906680d470b70ca1558e59dcf62f82955d645`
- Documentation base reviewed: `44191b81ee956ca87ba41172278bf347560d20c8`
- Release: [`v0.1.13`](https://github.com/B-Divyesh/sf-diagram-source-studio/releases/tag/v0.1.13)
- Live site: <https://diagram-source-studio.sociobot.in>
- Full report: [verification-11.md](verification-11.md)

The product checks Mermaid and compact D2 renders before a commit. It is for
engineers who keep diagram source in Git. The first action is **Try it with
sample data**.

## What was verified

Fresh 1440×900 desktop and 390×844 phone browsers showed the job, audience,
first action, action result, and all three facts before scrolling. The
one-click demo loaded a realistic 215-byte Mermaid project, rendered output,
kept its persistent sample label, reset correctly, and did not change a real
storage sentinel.

Normal Mermaid and D2 rendering, empty and malformed source, Unicode labels,
recovery, SVG/PNG export, invalid licenses, keyboard order, pane arrows,
focus, phone targets, 200% reflow, reduced motion, offline reload, route
titles, legal pages, the designed HTTP 404, privacy requests, response
headers, links, and performance all passed. Live Axe found zero violations on
all five routes.

All 21 exact claim commands passed independently from a fresh GitHub clone.
The full suite passed 13 route/accessibility tests, all 21 isolated claims,
and five regressions. The production build, audit, live billing check,
release-version check, Rust format/test/check/Clippy gates, live shell and
PowerShell installers, and deployment byte comparison passed.

The `v0.1.13` tag, successful release workflow, and `latest.json` all identify
implementation `f2a9066`. All five platform URLs respond. The Linux AppImage
matched `SHA256SUMS`, opened in a clean XDG profile, rendered the bundled
sample, loaded the $39 buy link, rejected a benign invalid license, and kept
the buy link. This proves the native billing repair in the shipped artifact.

Fresh mobile Lighthouse results were:

| Route | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 97 | 100 | 100 | 100 | 2.445 s | 32 ms | 0 |
| `/demo` | 100 | 100 | 100 | 100 | 1.213 s | 0 ms | 0.00024 |

## Run the verification

Install Node.js 22, npm, Chromium for Playwright, PowerShell 7, Rust, and the
Ubuntu Tauri packages listed in README. Then run:

```sh
npm ci
npm test
npm run build
npm run verify:release
npm audit --audit-level=high
npm run test:live:billing
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo clippy --locked --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Machine-readable evidence and screenshots are under
`.factory/verification-artifacts-11/`.

## Known limits and operator action

- Desktop packages are intentionally unsigned, and the download page says so.
  Before signed releases are advertised, configure signing and provide
  `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` to the release workflow.
- macOS and Windows artifacts were built and gated on native GitHub runners
  but were not launched from this Linux verifier.
- Compact D2 intentionally supports nodes, labels, and arrows, not the full D2
  language.
- No application updater is advertised or configured.
- This static/Tauri product has no product backend, tenant store, health
  endpoint, or restart-persistence path.

No product code was changed during verification 11.
