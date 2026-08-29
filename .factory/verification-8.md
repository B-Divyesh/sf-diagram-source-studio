# Independent product verification 8 — PASS

Verified 2026-08-29 from clean candidate commit
`149bbcfb22331c31cb907c4c09b18e4df3298e21` against
<https://diagram-source-studio.sociobot.in>.

## Verdict

**PASS — accept this candidate.** The live HTML, CSS, and JavaScript are
byte-identical to the fresh production build of the tested commit. The prior
deployment-only concern is not reproduced.

## Mandatory first-read and claims gates

Before product-code inspection, I ran `npm ci`, then every exact command in
`.factory/claims.json` against the demo entry point. The manifest exists and
all 21 independently invoked claim commands passed (the final Playwright run
status is `passed`, with no failed tests):

`demo-sandbox`, `private-local`, `editable-export`, `renderer-matrix`,
`d2-preview`, `offline-core`, `license-enforcement`,
`native-file-dialogs`, `offline-reference`, `safe-svg`, `no-tracking`,
`unsigned-builds`, `release-installers`, `studio-purchase`, `billing-catalog`,
`license-verdict-one-day`, `refund-revocation`, `no-sign-in`,
`free-editor-diagnostics`, `startup-network`, and `checkout-provider`.

A cold, uncached 1440px live load answers the mandatory questions in plain
words:

- It does: “Catch broken diagram renders before commit.”
- It is for: engineers keeping Mermaid or D2 files in Git.
- First action: **Try it with sample data**; the adjacent copy says it loads a
  Mermaid project in the browser.

That action opens the isolated `/demo` workbench with a realistic diagram and
the persistent “Demo — sample data, nothing is saved” banner, **Reset demo**,
and **Start for real**.

## Product, privacy, and accessibility checks

- Live normal Mermaid with Unicode labels rendered successfully. Malformed
  Mermaid produced “The 11.17.2 renderer stopped … Check the marked source.”
  Loading the sample recovered to “Syntax parsed. Preview rendered.”
- Compact D2 rendered `Client`, `API`, and the `request` arrow label. SVG
  export contained embedded editable-source metadata. The passing export claim
  additionally covers byte-for-byte BOM/CRLF/Unicode SVG and PNG round trips.
- A live service-worker-controlled `/demo` reload worked offline and rendered
  D2. `registration.update()` completed with cache
  `diagram-source-studio-v0.1.9`, active `sw.js`, and no waiting worker.
- After initial loading, demo edit/render/export recorded **no external
  requests**, no console errors, and no page errors. Cold landing requests
  were only self-hosted assets plus the disclosed public GitHub release lookup
  and Sociobot public product catalog; no diagram source was sent.
- Live Axe WCAG 2 A/AA/2.1 AA scans found zero violations, including zero
  serious/critical, on desktop `/` and 390px `/demo`. At 390px there was no
  horizontal overflow; keyboard begins at the skip link, moves it to `main`,
  and arrow keys switch the source/preview tabs. Reduced-motion transition
  duration is `0.01ms`.
- The 390px landing primary action is wholly within the first 844px viewport.
  The desktop cold page and demo have no console/page errors.

## Deployment, security, performance, and release checks

Fresh-build/live SHA-256 values match exactly:

| File | SHA-256 |
| --- | --- |
| `index.html` | `dca587038cad1f9d0c30efc4222ff44163c18f60714d410147a8f073524410d3` |
| `assets/main-RNKoJbJk.js` | `806831c5441e208ce163a8acfb8b6ed2ab7929f6697e9bf1a86ef7bfa010f353` |
| `assets/main-DAFxDuBT.css` | `c125074d667403d2d43fe7d8c332bfe47def0dee530f5f70146651b21a3def47` |

Live documents have a restrictive CSP with `frame-ancestors 'none'`, HSTS,
`nosniff`, strict-origin referrer policy, and denied camera/microphone/location
permissions. Documents and `sw.js` revalidate after 30 seconds; the hashed JS
is `public, max-age=31536000, immutable`. `/demo` is 200 and an unknown route
returns the designed page with HTTP 404.

The initial JS is 36.26 KB raw / 13.10 KB gzip, CSS is 16.92 KB raw / 4.63 KB
gzip, and the mobile hero image is 24.9 KB — all within the applicable budgets.

The product-unlock endpoint was probed with 40 simultaneous requests from one
client using an invalid token: **30 returned 200 and 10 returned 429**. Every
429 had `Retry-After: 4` and `X-RateLimit-After: 4`; observed allowance is 30
concurrent requests.

`npm run test:live:billing` passed: catalog price USD 3900, checkout returned
303, and the hosted Dodo checkout returned 200. GitHub Release `v0.1.9`
contains macOS arm64/x64, Windows MSI/EXE, Linux AppImage/deb, `latest.json`,
and `SHA256SUMS`. I downloaded the Linux amd64 deb; it reports package version
0.1.9 and SHA-256
`28bcd799232c046eec81bcd97c3ac9c25f9773ca86fcc16832b2bb027ac9ff5a`,
matching the release metadata.

## Local gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 186 packages installed, 0 vulnerabilities |
| all 21 exact claim commands | PASS |
| `npm test` | PASS — 12 accessibility/route tests plus all claim tests |
| `npm run build` | PASS — TypeScript check and Vite build to `dist/site/` |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `cargo fmt -- --check` | PASS |
| `npm run test:live:billing` | PASS |

`cargo test` could not compile in this disposable container because its image
lacks the host package `glib-2.0` (`glib-2.0.pc` not found). This is an
environment prerequisite rather than a source/build failure: the release
workflow installs the required Linux desktop packages and the independently
downloaded v0.1.9 native package is present and checksum-valid. The configured
production web build, which is the deployed artifact, passed.

## Defects

None found at release-blocking, high, medium, or low severity. No product code
was modified during verification.
