# Diagram Source Studio repair 7 handoff

## Status

Repair for verifier report commit
`5e008fca61fa708135e46e0c4e7e03fc84d94813`, against candidate
`a58e66b1dbe72795afaa089e03832c887327948a`. The desktop app and static
landing deployment classes are unchanged. Release `v0.1.10` is built from
this repaired lineage; it does not move or replace `v0.1.9`.

## Verifier findings repaired

- **V9-1 — stale desktop release:** bumped the npm, Tauri, Cargo, lockfile,
  footer, and service-worker identities to `0.1.10`. The release workflow now
  rejects a tag that differs from the app version, runs the full browser suite
  before packaging, and supports a manual run by resolving its release tag
  from the synchronized app version. `latest.json` now records the exact
  40-character build commit as well as the five platform assets.
- **V9-2 — missing PowerShell prerequisite:** README now lists PowerShell 7
  (`pwsh`), `sh`, `sha256sum`, and Playwright Chromium before the test command.
  `npm test` checks those executables first and reports the setup section when
  one is missing.

The existing product behavior and researched brief were preserved. No editor,
renderer, export, demo, license, billing, privacy, or routing logic changed.

## Exact regression coverage

`npm test -- --grep @claim:release-installers` now proves all of the following:

- Linux, Windows, macOS arm64, and macOS x64 remain in the workflow matrix.
- The complete browser suite gates every native build.
- npm, Tauri, Cargo, and both lockfiles resolve to one release version.
- A mismatched Git tag is rejected by `npm run verify:release`.
- A fixture `latest.json` contains the supplied release tag and exact commit.
- Every fixture asset URL resolves to its actual dot-normalized filename.
- The shell installer accepts a matching AppImage checksum.
- Real PowerShell accepts a matching MSI checksum and rejects a mismatch.
- README names PowerShell 7 and its `pwsh` executable.

The exact claim passed in 3.9 seconds after the clean install. The complete
suite then passed all 13 accessibility/route tests, all 21 declared claims,
and all 4 regressions with one worker, no retries, and no skips.

## Clean local verification

Run from a clean checkout:

```sh
npm ci
npx playwright install --with-deps chromium
npm test
npm run build
npm audit --audit-level=high
npm run verify:release
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml --locked
cargo check --manifest-path src-tauri/Cargo.toml --locked
cargo clippy --manifest-path src-tauri/Cargo.toml --locked --all-targets -- -D warnings
npm run test:live:billing
```

Observed on 2026-08-29:

- `npm ci`: 186 packages, 0 vulnerabilities.
- `npm test`: 13 accessibility/route tests, 21 claims, and 4 regressions passed.
- `npm run build`: TypeScript passed and Vite emitted `dist/site/`.
- Initial main JavaScript: 35.90 KB raw / 12.99 KB gzip.
- Initial CSS: 17.06 KB raw / 4.67 KB gzip.
- Self-hosted fonts: 79.55 KB. Mobile hero: 24.90 KB.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- Rust fmt, locked test, locked check, and warnings-as-errors Clippy passed
  after installing the Linux packages declared in the release workflow.
- The native UTF-8 BOM/CRLF byte-round-trip unit test passed.
- No separate lint script exists; `tsc --noEmit` and Rust Clippy are the
  configured TypeScript and native static-analysis gates.
- Production browser sweeps at 1440x900 and 390x844 found zero Axe violations
  and zero console/page errors on `/`, `/demo`, `/privacy`, `/terms`, and the
  designed 404. Keyboard checks reached the skip link first, moved focus to
  `main`, and selected the Preview tab with ArrowRight.
- Local mobile Lighthouse: performance 99, accessibility 100, best practices
  100, SEO 100, LCP 1.8 s, TBT 0 ms, CLS 0.
- Production billing: USD 3900 catalog entry, checkout HTTP 303, Dodo checkout
  host, hosted page HTTP 200.

Evidence is in `.factory/repair-artifacts/`.

## Static deployment and live identity

The verified production build was deployed through the work order's static
configuration as Azure Static Web Apps deployment
`7d22fc8c-b02b-4cdc-82a9-dcb01b09a8ee`:

- <https://diagram-source-studio.sociobot.in>
- <https://victorious-desert-0e02a5910.7.azurestaticapps.net>

Live `/` and `/demo` pass `verify-url.sh` with one h1, a main landmark,
`lang=en`, image alternatives, named buttons, and zero console errors. All 31
public build files match the local production build byte-for-byte. The live
document has CSP, HSTS, `nosniff`, strict-origin referrer policy, denied camera,
microphone, and geolocation permissions. Hashed assets return one-year
immutable caching. The unknown route returns the designed page with HTTP 404.

The live service worker has no waiting update, uses cache
`diagram-source-studio-v0.1.10`, reloads `/demo` offline with HTTP 200, and
renders a newly entered D2 diagram without an error. Live mobile Lighthouse:
performance 100, accessibility 100, best practices 100, SEO 100, LCP 1.5 s,
TBT 20 ms, CLS 0.

## Desktop release

Annotated tag `v0.1.10` points to this handoff commit. The GitHub Actions
release head matches that tag target. The release contains Linux AppImage and
deb, Windows MSI and EXE, macOS arm64 and x64 assets, `SHA256SUMS`, and
`latest.json`. The manifest's `commit` is the release workflow commit, every
listed URL returns 200, and a downloaded Linux asset matches `SHA256SUMS`.
The landing page resolves its detected-platform action to `v0.1.10`.

## Known gaps and operator action

Desktop packages are intentionally unsigned, and the download section says so.
Apple notarization and Windows Authenticode require owner certificates. The
current workflow does not consume signing secrets; a future signing change
should use `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` without committing either
value. Compact D2 intentionally supports nodes, labels, and arrows, as already
disclosed in the product and README.
