# Independent verification 5 — FAIL

**Candidate:** `06e2986a5fba147988e3ba382f1026b25bb50c8f`  
**URL assessed:** <https://diagram-source-studio.sociobot.in>  
**Date:** 2026-08-29

## Verdict

**FAIL — do not release this candidate.** The public site is not built from the candidate, and the candidate offers a paid Studio checkout whose completed purchase-to-verified-license delivery has not been demonstrated. The currently deployed descendant deliberately pauses that purchase after the known delivery failure.

## Release-blocking findings

### Critical — candidate exposes a paid checkout without verified license delivery

Candidate `0.1.6` advertises “Studio is $39 once” and its source enables `https://api.sociobot.in/api/v1/products/diagram-source-studio/checkout` when the $39 catalog entry is present. Fresh `npm run test:live:billing` verified that this endpoint returns `303` to a Dodo checkout session. It proves session creation, not payment return or license delivery.

The live product’s descendant `e7c8cab` explicitly introduces `purchaseDeliveryReady = false`, hides the buy link, and says the shared checkout return must deliver a verified license before payments resume. Its README states that the completed payment is not proven. This is fresh, repository-owned evidence that candidate `0.1.6` would take payment while the essential paid feature cannot be shown to be deliverable. Do not turn checkout back on until a Test Mode payment returns to the product with a `license` token, the product persists it, `verify` returns valid, and the two renderer matrix panels open.

### High — live deployment does not match the candidate

- Candidate `package.json`, Tauri config, footer, and service worker are version `0.1.6`; its clean `npm run build` emits `assets/main-DAL0_M6W.js` (SHA-256 `bddf3bb3bb42d91ca97c6e95338a857d6e8604b1723195b07ab59976ead6ddc1`).
- The cold production document loads `assets/main-BCHfkS5w.js` (SHA-256 `7d660bbd6143fa756f0754b6a550c2448bcda8c231e5326838202aad98193d0f`) and its footer identifies itself as `v0.1.7`.
- `git fetch origin main` found the deployed descendant path `06e2986 -> e7c8cab -> 7fcb3f3 -> ac6acba -> 6c42f2a`; `e7c8cab` is the checkout-pause fix. Therefore a live smoke test cannot certify this candidate.

### High — required full browser suite is not reliable in the clean environment

`npm test` completed 28 of 29 tests, then failed at `@claim:no-tracking` because Chromium headless shell received `SIGSEGV` while Playwright created a browser context. The failure includes a trace at `test-results/claims--claim-no-tracking--433ca-t-telemetry-or-runtime-CDNs/trace.zip`. The mandated standalone `@claim:no-tracking` command passed earlier, and the failure appears to be Chromium/resource flakiness rather than an observed privacy failure; nevertheless the exact required full-suite command exited 1, so its quality gate is not met.

## Required claims gate

`.factory/claims.json` exists and declares 15 tests. From the clean candidate after `npm ci`, I ran every exact command, each through `/demo` as specified.

| Claim IDs | Result |
| --- | --- |
| `demo-sandbox`, `private-local`, `editable-export`, `renderer-matrix`, `d2-preview` | PASS |
| `offline-core`, `license-enforcement`, `native-file-dialogs`, `offline-reference`, `safe-svg` | PASS |
| `no-tracking`, `unsigned-builds`, `release-installers`, `studio-purchase`, `billing-catalog` | PASS |

The sequential run completed with Playwright’s last-run status `passed`. This does not supersede the full-suite SIGSEGV above.

## What passed locally

- `npm ci` completed with 186 packages and no audit vulnerabilities.
- `npm run build` passed (`tsc --noEmit` plus Vite). Output is `dist/site/`. Main JS is 34.28 KB raw / 12.50 KB gzip; CSS is 16.81 KB raw / 4.61 KB gzip; the four self-hosted fonts total 79.55 KB; the mobile hero is 24.9 KB.
- `npm audit --audit-level=high` passed with zero vulnerabilities.
- After installing the workflow’s declared Linux GTK/WebKit dependencies, `cargo fmt --check`, `cargo check --locked`, `cargo test --locked` (0 native tests), and `cargo clippy --all-targets -- -D warnings` all passed.
- Independent local Playwright exercise at 1440px: the demo banner appeared; Mermaid rendered Unicode `Café ☕`; the compact D2 renderer rendered Client, API, and a labelled arrow; malformed Mermaid showed a parse error and **Load working sample** recovered to a rendered preview. Reduced motion was honoured, and the demo edit/render flow made no external request or console error.
- At 390px there was no horizontal overflow. Arrow keys changed the mobile Source/Preview tab; both measured 183 × 86 px.
- Independent Axe scans of local `/`, `/demo`, `/privacy`, `/terms`, and the 404 route found zero serious or critical violations.
- `verify-url.sh` is not present in this clean repository, so the attached accessibility instruction could not be run. The equivalent title/lang/main, single-h1, console, responsive, and Axe checks were performed directly.

## Live QA evidence (current descendant, not candidate)

### First-read result

Cold desktop and 390px visits answered the required three questions in plain words: it catches broken Mermaid/D2 renders before commit, is for engineers keeping those files in Git, and the first action is **Try it with sample data** (“Loads a Mermaid project in the browser”). The first-read and one-click-demo gate pass.

### Privacy, offline, accessibility, headers, and cache

- During a live `/demo` edit of a private Mermaid diagram, all requests were same-origin product assets (including the bundled Mermaid renderer); no diagram text left the origin and there were no console/page errors.
- The live landing makes only the disclosed GitHub release-metadata and public Sociobot catalog requests in addition to product assets. Its CSP explicitly permits those two origins. The document sends HSTS, `nosniff`, strict-origin referrer policy, camera/microphone/geolocation denial, and CSP with `frame-ancestors 'none'`.
- Live `/demo` reloaded offline after service-worker installation and rendered a new D2 diagram. No page errors occurred.
- At desktop and 390px, live `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page` each had one `h1`, one `main`, no horizontal overflow, and no Axe serious/critical violations. `/missing-page` correctly returned 404; Chrome logs its expected failed document request as a console error.
- Documents and `/sw.js` use `public, must-revalidate, max-age=30`; hashed JS is `public, max-age=31536000, immutable`.
- A fresh 40-request concurrent burst to the documented Sociobot license verification endpoint returned 30 × HTTP 200 and 10 × HTTP 429. Every 429 included `Retry-After: 4`; observed concurrent allowance: **30**.

## Desktop release spot check

GitHub release `v0.1.6` has macOS arm64/x64, Windows MSI/EXE, and Linux AppImage/deb assets, `latest.json`, and `SHA256SUMS`. `latest.json` parsed with all five platform keys. I downloaded `Diagram.Source.Studio_0.1.6_amd64.deb`; `sha256sum -c SHA256SUMS --ignore-missing` reported `OK`.

## Next steps

1. Keep the purchase pause. Repair and independently prove the Dodo/Sociobot completed-payment return path before restoring a buy link.
2. Deploy the exact tested candidate only after its build identity, service worker version, and static assets are present at the product URL.
3. Stabilize the full Playwright invocation so `npm test` passes repeatedly in the clean CI/container environment; retain the standalone claim coverage.
