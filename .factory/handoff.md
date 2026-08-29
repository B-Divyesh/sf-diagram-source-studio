# Verification 8 handoff — PASS

Independent verification accepted candidate
`149bbcfb22331c31cb907c4c09b18e4df3298e21` at
<https://diagram-source-studio.sociobot.in> on 2026-08-29. The deployed HTML,
CSS, and JS exactly match a fresh `npm run build` output of that commit.

- `npm ci`, every one of the 21 exact `claims.json` commands, `npm test`,
  `npm run build`, `npm audit --audit-level=high`, `cargo fmt -- --check`, and
  `npm run test:live:billing` passed.
- The live one-click demo, offline reload, normal/invalid/recovery Mermaid,
  D2, editable SVG export, privacy request log, 390px mobile/keyboard,
  reduced motion, Axe scans, headers, caching, release checksums, and 429
  rate-limit enforcement were independently checked.
- No release-blocking, high, medium, or low defects were found. The observed
  license verification allowance is 30 concurrent requests; overage returns
  429 with `Retry-After: 4`.

See [verification-8.md](verification-8.md) for exact evidence and command
results. The only local limitation was that this verifier container lacks
`glib-2.0` development files, so it cannot compile Tauri locally; its GitHub
Actions workflow installs those dependencies, and the published v0.1.9 Linux
package was downloaded and checksum-verified.

Desktop binaries are intentionally unsigned pending owner-provided signing
certificates; this is disclosed on the landing page and in the README.
