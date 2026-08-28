# Independent product verification 4 — FAIL

Verified on 2026-08-28 from clean candidate commit
`e24af7279ca1103702fb0e443497c1e5a3292277` against
<https://diagram-source-studio.sociobot.in>.

## Verdict

**FAIL — do not release.** The local-first editor, sample demo, documented
claims, production build, accessibility checks, deployment identity, privacy
boundaries, and rate limit all passed. The advertised $39 Studio purchase still
does not complete the required payment → returned license → verification →
unlocked comparison path. This is an externally owned Sociobot/Dodo gateway
failure, but it prevents a buyer from receiving the paid feature and therefore
blocks release.

## First-read and demo gate — PASS

On a cold live desktop and 390px mobile load, the first screen plainly answers
the required questions:

- **Does:** “Catch broken diagram renders before commit.”
- **For:** “engineers who keep Mermaid or D2 files in Git”.
- **First action:** **Try it with sample data**, with the caption “Loads a
  Mermaid project in the browser.”

The action is visible without setup and opens `/demo` in one click. The demo
immediately shows a realistic Mermaid sample, source and rendered preview, and
the persistent “Demo — sample data, nothing is saved” banner with **Reset
demo** and **Start for real**.

## Release-blocking finding

### High — successful test payment has no product return URL or license

I repeated the exact previously reported failure with fresh evidence rather
than relying on the builder report:

1. `GET https://pilot-api.sociobot.in/api/v1/products` returned the exact
   `diagram-source-studio` product: USD 3900 / $39.
2. Its checkout endpoint opened Dodo **Test Mode** for “Diagram Source Studio
   License”, $39.00, whose checkout copy says it is delivered as a license for
   the product page.
3. I completed contact and address details and submitted Dodo test card
   `4242 4242 4242 4242`, expiry `12/30`, CVC `123`.
4. Dodo showed **Payment Successful** for the $39 order. Its browser console
   recorded `Failed to submit form: {status: 403, responseStatus: 403, ...}`.
5. The success page was
   `https://test.checkout.dodopayments.com/status/GqTJDzKo/succeeded`, not the
   product URL. Its “Click here if not redirected” link had `href=""`; after
   eight seconds it remained on that page. There was no `license` query
   parameter and consequently no token to store, verify, paste, or use to
   enable Studio comparison.

The production contract itself is present: `npm run test:live:billing` found
the exact $39 USD product and a 303 redirect to
`checkout.dodopayments.com`. It does not prove the mandatory successful-return
path, which fails above.

## Claims and repository gates — PASS

`.factory/claims.json` exists. From the clean checkout I ran `npm ci`, then
every exact `test` command declared in that manifest separately through the
product's demo entry point. Every command selected one tagged test and passed:

| Claims | Result |
| --- | --- |
| `demo-sandbox`, `private-local`, `editable-export`, `renderer-matrix`, `d2-preview` | PASS |
| `offline-core`, `license-enforcement`, `native-file-dialogs`, `offline-reference`, `safe-svg` | PASS |
| `no-tracking`, `unsigned-builds`, `release-installers`, `studio-purchase`, `billing-catalog` | PASS |

Additional clean checks:

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 186 packages, 0 audit vulnerabilities |
| `npm test` | PASS — 29/29 Playwright tests |
| `npm run build` | PASS — `tsc --noEmit`, Vite production build, `dist/site/` |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `cargo fmt --check`, `cargo check --locked`, `cargo test --locked`, `cargo clippy -- -D warnings` | PASS — 0 Rust tests, no warnings |
| `npm run test:live:billing` | PASS — $39 USD, product URL, Dodo 303 |

No distinct lint command is defined; TypeScript checking is part of the exact
production build.

## Live QA, accessibility, privacy, and delivery — PASS

- Cold live Playwright logs had no console or page errors. The landing page
  requested only its own assets plus the explicitly disclosed GitHub release
  metadata and Sociobot public catalog. The `/demo` edit/export flow is covered
  by the passing privacy and no-tracking claims: no external request receives
  diagram content.
- `verify-url.sh` passed on `/` and `/demo`: 200 response, title, `lang=en`,
  one `h1`, main landmark, image alt coverage, and zero browser errors.
- Live axe scans at 1440px and 390px on `/demo` found zero violations,
  including zero serious/critical findings. Keyboard focus is a visible
  `rgb(54, 241, 228)` 3px outline; the first editor control measures 44px high.
  Mobile has no horizontal overflow. With reduced motion, maximum transition
  and animation duration is 0.00001s.
- Live documents have HSTS, `nosniff`, strict-origin referrer policy,
  camera/microphone/geolocation denial, `frame-ancestors 'none'`, and a CSP
  matching the GitHub and Sociobot connections. Unknown routes now return the
  designed 404 with HTTP 404. Hashed JS is cached one year immutable; documents
  and the service worker revalidate in 30 seconds.
- The required verification endpoint rate limit is enforced. A single-client
  fresh 40-request concurrent burst returned **30 × 200** and **10 × 429**;
  every 429 carried `Retry-After: 4`. Observed allowance: 30 concurrent
  verification requests.
- The live deployment exactly matches the candidate production build:

| File | SHA-256 |
| --- | --- |
| `index.html` | `dd191e719149e01cf45299211937283f112a84eef6757ee8a225b1848bf6fcb2` |
| `sw.js` | `1738285af16558cdb109696105bf12278c68484bacf5041fed15f49b79d5a447` |
| `assets/main-DAL0_M6W.js` | `bddf3bb3bb42d91ca97c6e95338a857d6e8604b1723195b07ab59976ead6ddc1` |
| `assets/main-B_eXGFp_.css` | `b43113146450dca0d45b6dbcbfa971aff727a3cbf2b2ce52ae5069784cddc53d` |

No sign-in exists, so Entra tenant validation is not applicable. AI is outside
the researched product scope and no AI feature is required for this local
render-verification workbench.

## Required action

Repair the shared Sociobot/Dodo payment-success return handler so a completed
payment redirects to `https://diagram-source-studio.sociobot.in/?license=...`
with a token accepted by `GET /api/v1/products/diagram-source-studio/verify`.
Then repeat the test-mode purchase and demonstrate that the Studio renderer
matrix unlocks from the returned verified license. No product code was changed
during this verification.
