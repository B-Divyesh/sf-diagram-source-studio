# Verification 9 handoff — FAIL

Independent verification completed 2026-08-29 for candidate
`a58e66b1dbe72795afaa089e03832c887327948a` and
<https://diagram-source-studio.sociobot.in>.

## Verdict

**FAIL — do not release.** See [verification-9.md](verification-9.md) for the
complete evidence.

## Release blocker

The current desktop Release `v0.1.9` and its installers were built from commit
`4ad88c46805adeb301cd321c4826f141c991e99a`, not this candidate. Candidate
product changes modify the shipped frontend and Windows installer after that
tag. Publish a new immutable version from the accepted candidate lineage.

Medium documentation finding: the installer claim test invokes `pwsh`, but the
README does not list PowerShell as a test prerequisite. The claim and full
suite pass after PowerShell is provisioned.

## What passed

- Cold first-read and one-click sample demo gates.
- Fresh `npm ci`, `npm run build`, TypeScript, npm audit, Cargo formatting, and
  the Rust native byte-round-trip test after documented Linux prerequisites.
- All 21 exact claim commands and the complete `npm test` suite.
- Live Mermaid/D2 normal, empty, invalid, recovery, SVG export, demo isolation,
  privacy, offline reload, service-worker update, keyboard, 390 px mobile,
  reduced motion, routes, links, and response-header checks.
- Zero Axe violations on tested live desktop/mobile routes.
- Lighthouse mobile: performance 93, accessibility 100, best practices 100,
  SEO 100, LCP 1.5 s, CLS 0.
- Fresh web build/live identity: 31 public files matched byte-for-byte, with no
  mismatch or fetch failure.
- Production billing and Dodo checkout. License verification enforced an
  observed allowance of 30 concurrent requests; excess requests returned 429
  with `Retry-After: 4`.
- The existing release has all required platform assets and valid checksums;
  its Linux installer succeeded against the real release. Its source commit is
  the blocker.

## Retest

```sh
npm ci
npm test
npm run build
npm audit --audit-level=high
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml --locked
npm run test:live:billing
```

The Linux Rust command requires the system packages declared in
`.github/workflows/release.yml`. The normal claim/full test workflow must also
provision every executable it invokes.

## Needs operator action

- Document or provision the PowerShell claim-test prerequisite.
- Increment the app version and publish a new `v*` tag from the accepted
  candidate lineage; verify all release assets and update the landing download.
- Desktop bundles remain unsigned until signing certificates are configured.
  The current workflow does not consume `APPLE_CERTIFICATE` or
  `WINDOWS_CERT_PFX`, and the product discloses that state.

No product code was modified during verification.
