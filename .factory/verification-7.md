# Independent product verification 7 — PASS

Verified on 2026-08-29 from clean candidate commit
`ab59594e72a2f7f1c204bd432509cbe8064ad381` against
<https://diagram-source-studio.sociobot.in>.

## Verdict

**PASS — release candidate accepted.** The deployed site is byte-identical to
the local production build, the one-click sandbox works, the desktop release
is published with a matching checksum, and all required local, browser,
privacy, offline, accessibility, and native gates pass.

## Required first-read and claims gates

Before reading product code, I installed dependencies and ran every exact
`.factory/claims.json` command against the product demo entry point. The
manifest exists and all 17 commands exited 0:

`demo-sandbox`, `private-local`, `editable-export`,
`renderer-matrix`, `d2-preview`, `offline-core`,
`license-enforcement`, `native-file-dialogs`, `offline-reference`,
`safe-svg`, `no-tracking`, `unsigned-builds`, `release-installers`,
`studio-purchase`, `billing-catalog`, `license-verdict-one-day`, and
`refund-revocation`.

A separate cold 1440px live load passes the first-read gate in plain words:

- It does: “Catch broken diagram renders before commit.”
- It is for: engineers keeping Mermaid or D2 files in Git.
- First click: **Try it with sample data**, with the adjacent explanation
  “Loads a Mermaid project in the browser.”

That one click opens `/demo`, immediately loads a realistic architecture
diagram, and shows the persistent **Demo — sample data, nothing is saved**
banner with **Reset demo** and **Start for real**.

## End-to-end live checks

- Normal Mermaid with Unicode labels rendered successfully. Empty/invalid
  Mermaid gave a clear parse error; replacing it with `A --> B` recovered to
  “Syntax parsed. Preview rendered.”
- Compact D2 input rendered Client, API, and the request arrow label.
- SVG export contained source metadata; the editable SVG/PNG round-trip,
  including BOM, CRLF, and Unicode bytes, is independently covered by the
  passing claim test.
- Reset restored the shipped sample. A demo edit/export flow produced no
  external requests after initial load and no console/page errors.
- Service worker was controlling `/demo`; after an online visit and reload,
  an offline reload rendered a newly entered D2 diagram with no errors.
- A fresh 390 × 844 mobile check had no horizontal overflow. Keyboard starts
  at the skip link, then reaches the app controls; the skip link has a visible
  3px cyan focus outline. Source/Preview tabs work with arrows.
- Live Axe scans on desktop `/` and 390px `/demo` found zero serious or
  critical violations (and no violations of any severity). Reduced-motion
  styles reduce motion to near-instant state changes.

## Privacy, headers, rate limiting, and performance

Cold landing requests were self-hosted assets plus the disclosed public GitHub
release lookup and Sociobot public catalog. The actual edit/render/export flow
made no off-origin request and sent no diagram source. There is no telemetry
or runtime CDN.

The live response sends HSTS, `nosniff`, strict-origin referrer policy,
camera/microphone/geolocation denial, and a CSP with
`frame-ancestors 'none'`. Documents and `sw.js` revalidate after 30s;
hashed JS uses `public, max-age=31536000, immutable`. `/demo` returns 200
and an unknown route returns the designed 404 with HTTP 404.

A 40-request concurrent probe to the documented license-verification endpoint
from one client returned **30 × 200** and **10 × 429**. Every 429 carried
`Retry-After` (3 or 4 seconds) and `X-RateLimit-After`; observed allowance
is 30 concurrent requests.

The initial main script is 35,847 bytes raw / 12,992 bytes gzip and CSS is
16,806 bytes raw / 4,628 bytes gzip. Mermaid is deferred until a source change
or comparison, so the initial web load is within the supplied JS/CSS budgets.

## Local and release gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 186 packages, 0 vulnerabilities |
| Every exact claim command | PASS — 17/17 |
| `npm test` | PASS — exit 0; 11 baseline + 17 claim + 5 regression tests |
| `npm run build` | PASS — TypeScript check and Vite build to `dist/site/` |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `npm run test:live:billing` | PASS — USD 3900, checkout 303, Dodo-hosted page 200 |
| Rust fmt/test/check/Clippy | PASS — 1 native byte-round-trip test; warnings denied |

No separate npm lint command exists.

Live/local SHA-256 comparisons match byte-for-byte:

| File | SHA-256 |
| --- | --- |
| `index.html` | `4100d39c263b11cdf83cf09ab631e49882764c80a9af5f25de73d6ed2f8bd28c` |
| `demo.html` | `7b378ca885579904685465b5bf1dc1fecef843df80fec0f3392102ae6277d0a9` |
| `sw.js` | `f5b710bda62752c56addbdc697e8d738cbf38720e275523ce9260c8cee188a18` |
| `assets/main-CQ7BGZPZ.js` | `684a29bdc53d48915f40871d78ccd09ff33e520f652d53c33751d531b5223845` |
| `assets/main-B_eXGFp_.css` | `b43113146450dca0d45b6dbcbfa971aff727a3cbf2b2ce52ae5069784cddc53d` |

GitHub Release `v0.1.9` contains macOS arm64/x64, Windows MSI/EXE, Linux
AppImage/deb, `latest.json`, and `SHA256SUMS`. I downloaded the Linux amd64
deb: it reports package version 0.1.9 and its
`28bcd799232c046eec81bcd97c3ac9c25f9773ca86fcc16832b2bb027ac9ff5a`
SHA-256 matches the release manifest.

There is no sign-in, so Entra tenant validation is not applicable. AI is not
needed for this local render-verification product and is absent.

## Defects

None found at release-blocking, high, medium, or low severity.

No product code was changed during verification.
