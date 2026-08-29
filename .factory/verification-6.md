# Independent product verification 6 — FAIL

Verified on 2026-08-29 from clean candidate commit
`eaaaf6d8511bf1616679581db76ae09c4a39b7bd` against
<https://diagram-source-studio.sociobot.in>.

## Verdict

**FAIL — do not release.** The live product, deployment identity, desktop
packages, and completed test-mode purchase now work. The earlier external
Sociobot/Dodo return failure is fixed. This candidate still fails repository-
controlled acceptance gates: the exact full `npm test` command crashes its
single Chromium process reproducibly, one required claim test does not test
the behavior it claims, and user-facing claims remain outside the mandatory
claim manifest. The live demo also misses the stated mobile performance and
JavaScript budgets.

## First-read and demo gate — PASS

A cold 1440 × 900 live load answers all three required questions in the first
viewport:

- **Does:** “Catch broken diagram renders before commit.”
- **For:** “engineers who keep Mermaid or D2 files in Git”.
- **First action:** **Try it with sample data**, captioned “Loads a Mermaid
  project in the browser.”

One click opens `/demo`. It immediately shows six lines of realistic Mermaid
source, a rendered architecture diagram, diagnostics, and the persistent
“Demo — sample data, nothing is saved” banner with **Reset demo** and **Start
for real**. Evidence: `verification-artifacts-6/live-first-read.json`,
`live-first-read-desktop.png`, `live-demo-desktop.png`, and
`live-demo-mobile-390.png`.

## Release-blocking findings

### High — the required full test gate crashes reproducibly

After clean `npm ci`, `npm test` was run twice. Both runs reached the same
point, then the Playwright 1.58.2 Chromium process received
`SIGSEGV (SEGV_MAPERR 0x1b0)` before `@claim:no-tracking` could create its
browser context. Each run ended **28 passed / 1 failed** and exit 1. The suite
already uses one worker, no retries, and `fullyParallel: false`; the claimed
repair therefore does not make the exact required gate reliable in this
worker. At failure time the host still had about 2.8 GiB available memory, and
Playwright already supplied `--disable-dev-shm-usage`.

The individual `@claim:no-tracking` command passes, as do all other claim
commands in isolation. That does not satisfy the repository definition of done,
which separately requires the complete `npm test` command to pass.

### High — `native-file-dialogs` is a presence test, not a claim test

`.factory/claims.json` claims that “The desktop app provides native open and
save actions.” Its required test sets a fake `__TAURI_INTERNALS__` object and
only asserts that **Open file** and **Save source** buttons are visible. It
never invokes either command, opens a native dialog, reads a selected file, or
saves and reopens bytes. This violates the claims contract’s explicit rule
that tests prove the promised result rather than the presence of a button.
Rust compilation and source inspection show implementations exist, but they
do not repair the required observable claim test.

### High — claim-like live statements are missing from `claims.json`

The strict claim inventory is incomplete. These user-facing promises have no
claim entry and no dedicated tagged test:

- Privacy: “The app ... stores the result for one day.” Existing tests do not
  advance time or prove the 24-hour verification cache boundary.
- Pricing/terms: “Refunds revoke the license” / “A refunded license stops
  working.” No test exercises a revoked/refunded token.

Under the supplied claims contract, any unlisted claim is release-blocking.

### Medium — the live demo misses the supplied performance budgets

A fresh Lighthouse 12.8.2 mobile run on `/demo` scored **81 performance**
(accessibility, best practices, and SEO were each 100), with **755 ms total
blocking time**, 1.42 s LCP, and 0.00048 CLS. It transferred 953,897 bytes of
JavaScript on first use, almost all from the bundled Mermaid 11 renderer
(941,086 compressed bytes; 3,572,661 raw). That exceeds the supplied 200 KB
initial-JS budget and the ≥90 Lighthouse target. The landing page itself scored
96 performance, 100 accessibility/best-practices/SEO, 1.52 s LCP, 227 ms TBT,
0 CLS, and 171,158 total transferred bytes. Evidence:
`verification-artifacts-6/lighthouse-root.json` and
`lighthouse-demo.json`.

### Medium — initial focus bypasses the skip link and preceding controls

Every route focuses its `<h1>` during initial rendering. On a fresh 390 px
landing load, the first Tab goes directly to **Try it with sample data**. On a
fresh `/demo` load, it goes directly to **Diagram language**, bypassing the
skip link, Reset demo, Start for real, Open file, and export controls until
focus wraps. Reached controls have a visible 3 px cyan focus outline and no
keyboard trap was found, but the initial focus order defeats the skip link and
is not the document order expected by keyboard-only users.

## Claims gate

`.factory/claims.json` exists with 15 entries. The literal pre-install pass
failed uniformly because dependencies were not installed. After the mandated
clean `npm ci`, every exact command was rerun independently and passed one
matching tagged test:

| Claim ID | Independent result |
| --- | --- |
| `demo-sandbox` | PASS — reset restored sample; no real/license storage keys |
| `private-local` | PASS — no diagram content left origin |
| `editable-export` | PASS — SVG and PNG restored BOM/CRLF Unicode source byte-for-byte |
| `renderer-matrix` | PASS — licensed fixture rendered both bundled versions |
| `d2-preview` | PASS — compact nodes, labels, and arrow rendered |
| `offline-core` | PASS — offline reload and D2 edit/render |
| `license-enforcement` | PASS — unverified offline token stayed locked |
| `native-file-dialogs` | **INVALID TEST** — buttons only; behavior not exercised |
| `offline-reference` | PASS |
| `safe-svg` | PASS — active/external content removed |
| `no-tracking` | PASS in isolation; full suite crashes before it runs |
| `unsigned-builds` | PASS |
| `release-installers` | PASS |
| `studio-purchase` | PASS fixture; also passed fresh real test-mode payment below |
| `billing-catalog` | PASS |

Because one test does not prove its claim and claims are missing, the claims
gate fails despite all 15 commands exiting 0 in isolation.

## End-to-end product and recovery checks

- Mermaid normal input rendered. Malformed `A -->` input produced “The
  11.17.2 renderer stopped: Parse error ... Check the marked source”; replacing
  it with valid source recovered to “Syntax parsed. Preview rendered.”
- Empty input produced “The source is empty. Type a diagram or load the
  sample.” A 151-node Mermaid chain rendered in 1.30 s in this live browser.
- Compact D2 normal input rendered nodes, labels, and an arrow. Unsupported D2
  syntax produced a line-specific warning rather than silently claiming full
  support.
- Live SVG (18,825 bytes) and PNG (54,924 bytes) exports contained editable
  source metadata. The tagged round-trip test separately proved BOM, CRLF, and
  Unicode bytes exactly.
- A Mermaid `javascript:` click directive produced no preview anchors,
  scripts, embedded objects, event attributes, external attributes, or
  outbound request.
- Reset restored the sample and demo mode wrote no `real:*` or `sb_license:*`
  keys. No diagram source appeared in any outgoing request.

Evidence: `verification-artifacts-6/live-product-qa.json` and
`live-boundary-security.json`.

## Paid path — PASS; prior external blocker is resolved

Fresh evidence replaced the previous failure:

1. The pilot catalog returned `diagram-source-studio`, USD 3900.
2. Checkout opened Dodo Test Mode for “Diagram Source Studio License”.
3. A fresh purchase with Dodo’s documented success card reached
   `/status/.../succeeded`.
4. Dodo redirected through the pilot return endpoint (HTTP 303) to the live
   product with `?license=...`.
5. The product stored the token and removed it from the address.
6. Both pilot and production verification endpoints returned
   `{ valid: true, reason: "ok" }` for that token.
7. In the simulated native app, the exact returned entitlement displayed
   “Studio license active” and rendered two matrix panels headed Mermaid
   11.17.2 and Mermaid 10.9.8.

The issued token is redacted from committed evidence. See
`verification-artifacts-6/pilot-payment-trace.json` and
`pilot-license-unlock.json`.

## Accessibility, privacy, headers, routing, and offline

- Live Playwright Axe checks found zero serious/critical findings on the demo
  at desktop and 390 × 844. The committed suite also passed its Axe checks for
  `/`, `/demo`, `/privacy`, `/terms`, and the 404 before the later browser
  crash.
- At 390 px there was no horizontal overflow, no visible control below 44 px,
  Source/Preview arrow-key navigation worked, and reduced-motion emulation left
  no active transition or animation. The 200% font-size probe did not create
  horizontal overflow.
- `/opt/fleet/lib/verify-url.sh` passed live `/` and `/demo`: HTTP 200,
  route-specific title, `lang=en`, one H1, main landmark, alt text, labeled
  buttons, and zero product console/page errors.
- The cold landing requested its own assets, GitHub release metadata, and the
  disclosed Sociobot public catalog. The edit/render/export flow sent no
  diagram content. There are no analytics or runtime-CDN requests.
- Responses include HSTS, `nosniff`, strict-origin referrer policy,
  camera/microphone/geolocation denial, and a matching CSP with
  `frame-ancestors 'none'`. Hashed assets and renderer bundles use one-year
  immutable caching; documents and `sw.js` revalidate after 30 seconds.
- `/`, `/demo`, `/privacy`, and `/terms` return 200; an unknown route returns
  the designed 404 with HTTP 404. All same-origin landing links return 200.
- Service-worker update code uses a versioned `diagram-source-studio-v0.1.8`
  cache, `skipWaiting`, old-cache deletion, and `clients.claim`. After an online
  visit, live `/demo` reloaded offline and rendered a newly entered D2 diagram
  without console errors.

## Request allowance

A fresh 40-request concurrent burst from one client to the product verification
endpoint returned **30 × 200** and **10 × 429**. Every 429 included
`Retry-After: 3` (and `X-RateLimit-After: 3`). Observed allowance: **30
concurrent verification requests**.

## Build, release, and deployment identity

| Check | Independent result |
| --- | --- |
| `npm ci` | PASS — 186 packages, 0 vulnerabilities |
| Every exact claims command | PASS individually, subject to invalid/missing claim coverage above |
| `npm test` | **FAIL twice — 28/29, reproducible Chromium SIGSEGV** |
| `npm run build` | PASS — TypeScript check + Vite; `dist/site/` exists |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `npm run test:live:billing` | PASS — USD 3900, Dodo 303, hosted checkout 200 |
| Rust fmt/check/test/clippy | PASS after documented Tauri Linux prerequisites; 0 native unit tests |
| `verify-url.sh` live `/` and `/demo` | PASS |

No separate npm lint command exists. Rust Clippy is the available native lint
gate.

The local production build and live deployment match byte-for-byte:

| File | SHA-256 |
| --- | --- |
| `index.html` | `3717e509d4e749e5e5ea4b214e76a34cc2e87aa1558904f7139d4b44a496a47e` |
| `sw.js` | `7f823c4faa0d4b233235d441133ec6daa632d3e5749dc87a6024835990f7245b` |
| `assets/main-B03FB11N.js` | `2defec59c480ac021481267ac4f4398c7e2be7a4a00756acffdb0e00bfef7601` |

Candidate changes after tagged product commit `35587be` are documentation
only. Release `v0.1.8` contains macOS arm64/x64, Windows MSI/EXE, Linux
AppImage/deb, `latest.json`, and `SHA256SUMS`. The downloaded 6,201,562-byte
amd64 deb reports version 0.1.8 and its hash matches the manifest
(`1738ad58...58a37f`). The live shell installer installed the checksum-verified
80,583,160-byte AppImage with matching hash
`b39f3156...b9ecc997`.

No sign-in exists, so Entra validation is not applicable. AI is not useful for
this local render-verification job and is correctly absent.

## Required actions

1. Make the exact full `npm test` command stable in a clean constrained worker,
   then prove it passes repeatedly without retries or ignored failures.
2. Replace the `native-file-dialogs` visibility test with a packaged/native
   round trip that opens and saves bytes through the actual commands.
3. Add claim entries and tagged tests for the one-day verdict cache and refund
   revocation, or remove those statements.
4. Reduce or defer the initial Mermaid payload so `/demo` meets the supplied
   performance and JavaScript budgets.
5. Do not focus the H1 on initial document load; preserve H1 focus for actual
   client-side route changes so the skip link remains first in document order.

No product code was modified during verification.
