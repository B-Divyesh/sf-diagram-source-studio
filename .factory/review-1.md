# Adversarial first-read review 1 — FAIL

Reviewed 2026-08-29 against local commit `42c8520a533615c8097e6837077a02c232f043f9` and the live site at <https://diagram-source-studio.sociobot.in>. This was a read-only product review; no product code was changed.

## Verdict

**FAIL.** The core job is clear and genuinely tryable: a cold visitor can identify the diagram-render comparison job, the audience, and the sample-demo action; the one-click demo is populated and isolated; all listed claim commands pass. The `/demo` route nevertheless omits the required site navigation and footer, and the copy/claims audit has remaining findings. There are four findings, so this is not PASS.

## Findings

### F-1-1 — BLOCKING — `/demo` is outside the required site skeleton

**Location:** live `/demo`, desktop and 390 px; `src/editor.ts:30-65`; contrast `src/main.ts:17-22`.

The demo replaces the normal site header with an editor-only header containing **Open file**, **Save source**, and export buttons. It has no Demo/Download/Privacy navigation, no visible Privacy or Terms link, and no footer at all. The live DOM contains the demo banner, editor header, and `<main>`, but no `.site-footer`; the only legal link is an in-editor **See Studio purchase options** link. The normal header and footer are present on `/`, `/privacy`, `/terms`, and the designed 404.

This breaks the required consistent header/footer and leaves a first-time mobile visitor in the demo with no obvious route to privacy terms. It is especially material because the demo makes the privacy promise **“Demo — sample data, nothing is saved.”**

**Concrete fix:** retain the editor controls, but add the normal compact site navigation (at least Home, Privacy, Terms) to `/demo` and append the standard footer after the editor. Ensure the links remain 44 px targets and do not obscure source/preview controls on 390 px. Add a route test that asserts the `/demo` header has Privacy and the footer has Privacy and Terms.

### F-1-2 — HIGH — public claims remain outside `.factory/claims.json`

**Location:** landing pricing/boundary copy and README; `.factory/claims.json`; `tests/claims.spec.ts`.

The manifest and its 17 tagged tests cover exports, bundled versions, D2, local edit/export traffic, catalog lookup, license caching/revocation, and releases. They do not name or directly test these claim-like promises:

- Landing: **“The editor has no accounts, hosting, collaboration, analytics, or AI generation.”** The `no-tracking` entry only claims no telemetry/runtime CDN; its test records a `/demo` edit flow. It cannot establish the absence of accounts, hosting, collaboration, or AI generation.
- Landing: **“The free editor previews, diagnoses, and exports diagrams.”** Preview and export are covered indirectly by other claims, but no entry claims or tests diagnostics/recovery.
- Landing and README: **“Sociobot/Dodo is the merchant of record.”** There is no manifest entry for this customer-facing payment identity.
- README privacy: **“Renderer scripts and fonts ship with the app.”** and **“The download panel requests public release data from GitHub.”** These are privacy/network assertions with no corresponding manifest entry and observable request test.

Under the supplied claims rule, a visitor-facing statement they could rely on needs a listed, observable test or must be removed. The current suite passing does not close these gaps.

**Concrete fix:** either remove or narrow the untestable inventory sentence to the proven local-data boundary, or add entries and tagged tests. At minimum add `free-editor-diagnostics` (fresh `/demo`, malformed Mermaid produces a useful diagnostic and **Load working sample** recovers); add a network/bootstrap claim that records the precise GitHub/catalog requests and verifies no diagram source is sent; and test the merchant wording against the checkout contract or replace it with a directly verifiable statement such as “Checkout is hosted by Dodo Payments.”

### F-1-3 — MINOR — four README sentences exceed the 22-word cap

**Location:** README copy-audit items 4, 21, 37, and 44 below.

The plain-words hard cap is 22 words. Each sentence below packs several actions into one long line:

- **28 words:** “Edit source beside its real output, read diagnostics, compare bundled Mermaid 10.9.8 and 11.17.2 renderers, and export SVG or PNG files that preserve the source byte for byte.”
  - Rewrite: “Edit source beside its output. Read diagnostics. Compare Mermaid 10.9.8 with 11.17.2. Export SVG or PNG with the source embedded.”
- **28 words:** “After payment, checkout returns to the product with a license token; the app stores it locally, removes it from the address, verifies it with Sociobot, and enables Studio.”
  - Rewrite: “After payment, checkout returns a license token. The app saves it locally, removes it from the address, verifies it, and enables Studio.”
- **25 words:** “The browser suite records the completed browser contract: a returned `license` token is saved, removed from the URL, verified, and enables both Studio comparison panels.”
  - Rewrite: “The browser suite tests a returned license token. It confirms that Studio comparison becomes available.”
- **24 words:** “The app checks Sociobot’s public catalog once to show whether Studio is available; a license check sends only the token you enter to `api.sociobot.in`.”
  - Rewrite: “The app checks Sociobot’s public catalog once. A license check sends only the token you enter.”

### F-1-4 — MINOR — headings use jargon, metaphor, or incomplete context

**Location:** landing hero/boundary/downloads; README `## Free and Studio`.

- **“Renderer inspection workbench”** uses product jargon before the visitor knows the job. Rewrite: **“Diagram renderer comparison.”**
- **“Your diagrams do not become a service”** is a mood/metaphor heading rather than a section name. Rewrite: **“Privacy and product limits.”**
- **“Install it beside your repository”** does not name the section’s content. Rewrite: **“Download the desktop app.”**
- **“Free and Studio”** is incomplete out of context. Rewrite: **“Free editor and Studio license.”**

## Cold first read

Fresh browser contexts, before scrolling:

| Viewport | What it does | Who it is for | First click | Result |
| --- | --- | --- | --- | --- |
| 390 × 844 | “Catch broken diagram renders before commit” | “For engineers who keep Mermaid or D2 files in Git and need to inspect real output.” | “Try it with sample data” | PASS |
| 1440 × 900 | Same headline and audience sentence | Same | “Try it with sample data” | PASS |

The action is fully visible at both sizes. On 1440 × 900 the explanatory caption, **“Loads a Mermaid project in the browser.”**, begins below the fold, but the labelled action itself remains unambiguous. There were no live console/page errors on `/` in either cold context.

## Demo and sandbox

PASS for the demo-specific gate.

- One click from the landing page opens `/demo`; direct `/demo` also works.
- The first screen already shows a realistic Mermaid architecture source, populated renderer preview, a success diagnostic, source/preview controls, and exports.
- The persistent banner says **“Demo — sample data, nothing is saved”** and exposes **Reset demo** and **Start for real**.
- I seeded `real:diagram-source-studio:document` with `REAL-DO-NOT-TOUCH`, edited the demo, selected Reset demo, then selected Start for real. The real key remained unchanged; Reset restored the 215-byte shipped Mermaid sample. The demo wrote no `sb_license:*` or `real:diagram-source-studio:*` key.
- A fresh live `/demo` edit/render/export request log contained only same-origin app assets. It made no console or page error.

## Claims and clean-clone tests

PASS for every listed test. In a fresh local clone at `/tmp/diagram-review-clone.MNWifl`, `npm ci` installed 186 packages with 0 audit vulnerabilities. `npm test` invokes each manifest command in a fresh Playwright process; `test-results/.last-run.json` records `"status": "passed"` and no failed tests. `npm run build` also passed and emitted `dist/site/`.

| Claim id | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `private-local` | PASS |
| `editable-export` | PASS |
| `renderer-matrix` | PASS |
| `d2-preview` | PASS |
| `offline-core` | PASS |
| `license-enforcement` | PASS |
| `native-file-dialogs` | PASS |
| `offline-reference` | PASS |
| `safe-svg` | PASS |
| `no-tracking` | PASS |
| `unsigned-builds` | PASS |
| `release-installers` | PASS |
| `studio-purchase` | PASS |
| `billing-catalog` | PASS |
| `license-verdict-one-day` | PASS |
| `refund-revocation` | PASS |

The passing listed tests do not remove F-1-2: the supplied claims contract requires all visitor-facing claims to be listed.

## Copy audit

Counts treat hyphenated terms, product versions, and URLs as one word. Code blocks, raw URLs, and repeated diagram-code labels are excluded; headings, buttons, captions, and other visitor-facing copy are included. `F-1-3` and `F-1-4` identify the flagged entries. No landing item exceeds 22 words.

### Landing page

| # | Words | Copy |
| ---: | ---: | --- |
| 1 | 3 | Diagram Source Studio |
| 2 | 1 | Demo |
| 3 | 1 | Download |
| 4 | 1 | Privacy |
| 5 | 3 | Renderer inspection workbench *(F-1-4)* |
| 6 | 6 | Catch broken diagram renders before commit |
| 7 | 16 | For engineers who keep Mermaid or D2 files in Git and need to inspect real output. |
| 8 | 5 | Try it with sample data |
| 9 | 7 | Loads a Mermaid project in the browser. |
| 10 | 5 | Files stay on your device |
| 11 | 4 | Core editing works offline |
| 12 | 7 | Free editor · Studio is $39 once |
| 13 | 12 | A neon diagram on a repair bench has one broken magenta connection. |
| 14 | 7 | Render difference found between two bundled versions |
| 15 | 6 | Inspect the output beside its source |
| 16 | 5 | Use the browser demo now. |
| 17 | 9 | Install the desktop app when you need native files. |
| 18 | 6 | Check a diagram in three steps |
| 19 | 3 | Open the source |
| 20 | 9 | Choose a Mermaid or D2 file from your repository. |
| 21 | 3 | Compare the renders |
| 22 | 8 | Place two bundled Mermaid versions side by side. |
| 23 | 4 | Export an editable file |
| 24 | 9 | Save SVG or PNG output with the source embedded. |
| 25 | 7 | Your diagrams do not become a service *(F-1-4)* |
| 26 | 11 | The editor has no accounts, hosting, collaboration, analytics, or AI generation. *(F-1-2)* |
| 27 | 3 | Source stays local. |
| 28 | 7 | Purchase availability checks the public catalog once. |
| 29 | 8 | License checks send only the token you enter. |
| 30 | 4 | Compare two Mermaid versions |
| 31 | 8 | The free editor previews, diagnoses, and exports diagrams. *(F-1-2)* |
| 32 | 6 | Studio adds the side-by-side renderer matrix. |
| 33 | 2 | Studio comparison |
| 34 | 2 | $39 once |
| 35 | 2 | One-time license. |
| 36 | 10 | After payment, checkout returns here and verifies your Studio access. |
| 37 | 6 | Sociobot/Dodo is the merchant of record. *(F-1-2)* |
| 38 | 4 | Refunds revoke the license. |
| 39 | 5 | Already have a Studio license? |
| 40 | 6 | Download the app to paste it. |
| 41 | 5 | Install it beside your repository *(F-1-4)* |
| 42 | 11 | Desktop builds are unsigned until the project owner adds signing certificates. |
| 43 | 5 | Latest release: v0.1.9 for Linux |
| 44 | 3 | Download for Linux |
| 45 | 4 | Other platforms and checksums |
| 46 | 6 | Check diagram renders before you commit. |
| 47 | 4 | Built by Param Factory |
| 48 | 5 | v0.1.9 · Original generated artwork |

### README

| # | Words | Copy |
| ---: | ---: | --- |
| 1 | 3 | Diagram Source Studio |
| 2 | 9 | Catch Mermaid and D2 render changes before you commit. |
| 3 | 14 | Diagram Source Studio is a local-first workbench for engineers who keep diagrams in Git. |
| 4 | 28 | Edit source beside its real output, read diagnostics, compare bundled Mermaid 10.9.8 and 11.17.2 renderers, and export SVG or PNG files that preserve the source byte for byte. *(F-1-3)* |
| 5 | 2 | Live site: |
| 6 | 2 | One-click demo: |
| 7 | 2 | What ships |
| 8 | 7 | Mermaid preview through two self-hosted renderer versions. |
| 9 | 9 | A compact D2 renderer for nodes, labels, and arrows. |
| 10 | 6 | Syntax diagnostics and an offline reference. |
| 11 | 9 | Native open and save dialogs in the Tauri app. |
| 12 | 9 | SVG and PNG export with embedded UTF-8 source metadata. |
| 13 | 10 | A demo that keeps sample edits separate from real data. |
| 14 | 9 | No telemetry, diagram upload, third-party fonts, or runtime CDN. |
| 15 | 12 | The compact D2 renderer is intentionally smaller than the full D2 language. |
| 16 | 12 | Use Mermaid for diagrams that need shapes beyond nodes, labels, and arrows. |
| 17 | 3 | Free and Studio *(F-1-4)* |
| 18 | 11 | The free editor includes editing, diagnostics, single-version preview, and both exports. |
| 19 | 14 | Studio adds side-by-side Mermaid 10.9.8 and 11.17.2 comparison for a one-time $39 USD license. |
| 20 | 6 | Sociobot/Dodo is the merchant of record. *(F-1-2)* |
| 21 | 28 | After payment, checkout returns to the product with a license token; the app stores it locally, removes it from the address, verifies it with Sociobot, and enables Studio. *(F-1-3)* |
| 22 | 10 | Existing Studio licenses can also be pasted into the app. |
| 23 | 6 | Run the site and browser demo |
| 24 | 5 | Requirements: Node.js 22 and npm. |
| 25 | 2 | Open `http://127.0.0.1:4173/demo`. |
| 26 | 10 | The production site build lands at the work-order path `dist/site`: |
| 27 | 4 | Run the desktop app |
| 28 | 12 | Install the current Tauri 2 system prerequisites, Rust, Node.js 22, and npm. |
| 29 | 2 | Then run: |
| 30 | 10 | Create a local platform bundle with `npm run tauri build`. |
| 31 | 12 | Release bundles are built on GitHub Actions, not in the factory worker. |
| 32 | 11 | Linux users can install the checked AppImage from the latest release: |
| 33 | 9 | Windows users can run the SHA256-checking installer from PowerShell: |
| 34 | 1 | Test |
| 35 | 11 | Playwright 1.58.2 runs each public claim from a clean browser context: |
| 36 | 21 | The live billing check confirms that the exact $39 USD product is present and that its Dodo-hosted checkout page responds successfully. |
| 37 | 25 | The browser suite records the completed browser contract: a returned `license` token is saved, removed from the URL, verified, and enables both Studio comparison panels. *(F-1-3)* |
| 38 | 5 | The claim manifest is `.factory/claims.json`. |
| 39 | 5 | The demo contract is `.factory/demo.md`. |
| 40 | 3 | Privacy and security |
| 41 | 13 | Diagram contents stay on the device during the tested edit and export flow. |
| 42 | 8 | Renderer scripts and fonts ship with the app. *(F-1-2)* |
| 43 | 17 | SVG output is parsed before display; scripts, links, embedded objects, event handlers, and external references are removed. |
| 44 | 24 | The app checks Sociobot’s public catalog once to show whether Studio is available; a license check sends only the token you enter to `api.sociobot.in`. *(F-1-3)* |
| 45 | 10 | Read the in-product `/privacy` and `/terms` routes for user-facing details. |
| 46 | 1 | Release |
| 47 | 12 | Push a `v*` tag or start Release desktop apps in GitHub Actions. |
| 48 | 11 | The workflow builds Linux, Windows, macOS arm64, and macOS x64 packages. |
| 49 | 12 | It publishes matching SHA256 checksums and `latest.json` URLs with the GitHub Release. |
| 50 | 8 | Unsigned builds show the operating system’s normal warning. |
| 51 | 9 | See `.factory/handoff.md` for signing secrets the operator must add. |
| 52 | 1 | License |
| 53 | 1 | MIT. |
| 54 | 2 | See `LICENSE`. |

## Structure, accessibility, routes, and links

Apart from F-1-1, these checks passed.

| Check | Evidence |
| --- | --- |
| Titles, language, headings, metadata | `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page` each had `lang=en`, one h1, a main landmark, a route-specific title and description, canonical URL, OG/Twitter image metadata, SVG favicon, and 180 px Apple touch icon. The social image is a real 1200 × 630 WebP. |
| Routing | `/demo`, `/privacy`, and `/terms` returned 200; `/missing-page` returned the designed page with HTTP 404. Navigation from Privacy to home and browser Back moved focus to the destination h1. |
| Links | All rendered destinations responded: same-origin routes 200, unknown route 404 by design, Dodo checkout 200 after redirect, release download 200, GitHub release 200, and sociobot.in 200. |
| Request privacy | Cold `/` loaded self-hosted assets plus the disclosed GitHub release and Sociobot public-catalog lookups. A fresh `/demo` edit/render/export flow made no off-origin request. |
| Accessibility and mobile | The committed Playwright Axe baseline passed on all five routes and 390 px demo. The clean suite also passed arrow-key panes, visible skip-link focus, 44 px mobile targets, and no horizontal overflow. |
| Visual identity | PASS. The authored night-market neon workbench, clipped plates, self-hosted Barlow Condensed/Atkinson Hyperlegible pairing, original artwork, and restrained cyan/magenta diagnostics are distinct and match `.factory/design.md`; this is not a generic SaaS template. |

## History and missed leverage

There are no earlier tracked `.factory/review-*.md` or `.factory/polish-*.md` files in this repository or its reachable history, so there are no prior finding IDs to re-open. I read the current handoff and independent verification history. Their former issues—checkout availability/return handling, demo storage isolation, byte-preserving exports, native file dialogs, installer filenames/checksums, unverified-license locking, mobile targets, one-day cache/refund behavior, test stability, first keyboard stop, and demo performance—are confirmed fixed by the live probes and the passing clean-clone suite above.

The brief implies local comparison and editable import/export, all of which are present. AI would not improve this local renderer-verification job enough to justify sending source through a gateway, and the product does not imply sync or collaboration. No missed-leverage finding is raised.

## What would make this perfect

1. Put `/demo` back inside the shared navigation/legal skeleton without compromising the focused desktop editor.
2. Remove or test every remaining public assertion, especially diagnostic recovery and the precise startup/network/payment wording.
3. Split the four long README sentences and rename the four contextless headings.

