# Adversarial first-read review 2 — FAIL

Reviewed 2026-08-29 against repository commit `0433c4193d9c00d44bd298beb97fa185b754c7ac` and the live site at <https://diagram-source-studio.sociobot.in>. This was a read-only product review. No product code was changed.

## Verdict

**FAIL.** The product's job, audience, and first action are clear without scrolling. The one-click demo is populated and isolated, every listed claim command passes from a clean clone, the round-1 defects are fixed, and the live route/link checks pass. Four findings remain. The owner requires zero findings and no untested claim for PASS.

There are no blocking findings in this round. F-2-1 and F-2-2 are high severity because they fail explicit first-screen and claim-proof requirements.

## Findings

### F-2-1 — HIGH — neither tested first screen contains the complete required first-screen package

**Location:** live `/`, fresh 390 × 844 and 1440 × 900 contexts, before scrolling.

At 390 × 844, the action result **“Loads a Mermaid project in the browser.”** is visible, but the third required fact, **“Free editor · Studio is $39 once”**, begins at y=838 and is clipped by the 844 px viewport. At 1440 × 900, **“Try it with sample data”** ends at y=892, while its result sentence and all three privacy/offline/price facts are below the fold. The oversized headline occupies y=173–714 on desktop and y=174–509 on mobile.

The three first-read questions are answerable, so this is not the prescribed blocking failure. It still violates the mandatory first-screen shape: no tested viewport shows the action, what happens next, and all three facts together. A visitor must scroll before seeing either the action's consequence on desktop or the price fact on mobile.

**Concrete fix:** reduce the headline size/line-height and hero vertical spacing at these breakpoints. Keep the headline, audience sentence, action, action-result sentence, and all three facts fully within 390 × 844 and 1440 × 900. Add a browser test that asserts the bottom edge of the result sentence and every `.plain-facts li` is no lower than `window.innerHeight` at both sizes.

### F-2-2 — HIGH — release claims extend beyond their listed test

**Location:** `README.md`, `.factory/claims.json` entry `release-installers`, and `tests/claims.spec.ts:197`.

The README makes these public claims:

- **“Release bundles are built on GitHub Actions, not in the factory worker.”**
- **“Windows users can run the SHA256-checking installer from PowerShell.”**
- **“The workflow builds Linux, Windows, macOS arm64, and macOS x64 packages.”**

The closest manifest entry claims matching platform filenames and SHA256 verification. Its test creates five artificial filenames, but it computes and verifies only the Linux AppImage checksum through `public/install.sh`. It never runs `public/install.ps1`, proves the Windows checksum path, or asserts the workflow's platform matrix and build location. The test passes, but these README subclaims remain untested. The claims contract requires the observable promise, not adjacent release machinery, to be asserted.

**Concrete fix:** add separate manifest entries or broaden `release-installers` precisely. Run the PowerShell installer against a temporary release fixture and assert both matching-checksum success and mismatched-checksum refusal. Parse the workflow to assert the four advertised build targets and GitHub Actions jobs. If those checks cannot run in the supported test environment, remove or narrow the three README sentences.

### F-2-3 — MINOR — public copy still uses internal jargon, inconsistent terms, and decorative labels

**Location:** live landing page and README; flagged rows in the copy audit.

- **“local-first workbench”** asks readers to decode two software-product terms. Rewrite: **“Diagram Source Studio runs on your device for engineers who keep diagrams in Git.”**
- **“self-hosted renderer versions”** conflicts with the clearer public term **“bundled versions.”** Rewrite: **“Mermaid preview through two bundled renderer versions.”**
- **“runtime CDN”** is infrastructure jargon. Rewrite: **“No telemetry, diagram uploads, third-party fonts, or code loaded from another site.”**
- **“work-order path”** is factory-internal language. Rewrite: **“The production site build is written to `dist/site`.”**
- **“renderer matrix”**, **“comparison”**, **“render”**, and **“output”** overlap for the same visible result and paid comparison. Use **“render”** for one generated diagram and **“side-by-side comparison”** for the paid view.
- **“01 / the product”**, **“02 / how it works”**, **“03 / clear boundary”**, **“04 / Studio license”**, and **“05 / desktop app”** are numbered decorative eyebrows. Remove them; the adjacent plain headings already name every section.

No sentence exceeds 22 words and no banned marketing adjective appears. Buttons name results or actions. The remaining failure is terminology and non-informational decoration.

### F-2-4 — MINOR — the 404 uses the product metaphor instead of naming the error plainly

**Location:** live unknown route, for example `/does-not-exist`.

The h1 is **“This diagram path is not connected”** and the explanation ends **“Return to the workbench entrance.”** Both require the visitor to translate brand metaphor while recovering from an error. This conflicts with the plain-words rule that an error and heading state what happened directly.

**Concrete fix:** use **“Page not found”** as the h1 and **“This page does not exist. Return to the home page.”** as the explanation. Keep the current designed broken-sign artwork and **“Return home”** action.

## Cold first read

Fresh contexts were opened before any scroll or interaction.

| Viewport | What it does, in my words | For whom | First click | Result |
| --- | --- | --- | --- | --- |
| 390 × 844 | Checks Mermaid or D2 renders for breakage before a commit. | Engineers who keep Mermaid or D2 files in Git. | **Try it with sample data** | PASS |
| 1440 × 900 | Same. | Same. | **Try it with sample data** | PASS |

The exact text that answers the questions is **“Catch broken diagram renders before commit”**, **“For engineers who keep Mermaid or D2 files in Git and need to inspect real output.”**, and **“Try it with sample data.”** F-2-1 concerns the rest of the mandatory first-screen package, not these three answers.

## Copy audit

Counts treat hyphenated terms, versions, URLs, and code paths as one word. Standalone punctuation is not a word. Repeated identical footer/navigation text is listed once. Diagram source snippets and non-sentence UI values such as `UTF-8` are excluded. Flags refer to F-2-3 unless noted.

### Landing page

| # | Words | Copy |
| ---: | ---: | --- |
| 1 | 3 | Diagram Source Studio |
| 2 | 1 | Demo |
| 3 | 1 | Download |
| 4 | 1 | Privacy |
| 5 | 3 | Diagram renderer comparison |
| 6 | 6 | Catch broken diagram renders before commit |
| 7 | 16 | For engineers who keep Mermaid or D2 files in Git and need to inspect real output. |
| 8 | 5 | Try it with sample data |
| 9 | 7 | Loads a Mermaid project in the browser. |
| 10 | 5 | Files stay on your device |
| 11 | 4 | Core editing works offline |
| 12 | 6 | Free editor · Studio is $39 once |
| 13 | 12 | A neon diagram on a repair bench has one broken magenta connection. |
| 14 | 7 | Render difference found between two bundled versions |
| 15 | 3 | 01 / the product *(decorative label)* |
| 16 | 6 | Inspect the output beside its source *(inconsistent “output”)* |
| 17 | 5 | Use the browser demo now. |
| 18 | 9 | Install the desktop app when you need native files. |
| 19 | 4 | 02 / how it works *(decorative label)* |
| 20 | 6 | Check a diagram in three steps |
| 21 | 3 | Open the source |
| 22 | 9 | Choose a Mermaid or D2 file from your repository. |
| 23 | 3 | Compare the renders |
| 24 | 8 | Place two bundled Mermaid versions side by side. |
| 25 | 4 | Export an editable file |
| 26 | 9 | Save SVG or PNG output with the source embedded. *(inconsistent “output”)* |
| 27 | 3 | 03 / clear boundary *(decorative label)* |
| 28 | 4 | Privacy and product limits |
| 29 | 8 | No sign-in is required to use the editor. |
| 30 | 6 | Diagram source stays on your device. |
| 31 | 7 | Purchase availability checks the public catalog once. |
| 32 | 8 | License checks send only the token you enter. |
| 33 | 3 | 04 / Studio license *(decorative label)* |
| 34 | 4 | Compare two Mermaid versions |
| 35 | 10 | The free editor previews, reports syntax problems, and exports diagrams. |
| 36 | 6 | Studio adds the side-by-side renderer matrix. *(jargon/inconsistent term)* |
| 37 | 2 | Studio comparison |
| 38 | 2 | $39 once |
| 39 | 2 | One-time license. |
| 40 | 10 | After payment, checkout returns here and verifies your Studio access. |
| 41 | 2 | Buy Studio |
| 42 | 5 | Already have a Studio license? |
| 43 | 6 | Download the app to paste it. |
| 44 | 7 | Studio checkout is hosted by Dodo Payments. |
| 45 | 4 | Refunds revoke the license. |
| 46 | 3 | 05 / desktop app *(decorative label)* |
| 47 | 4 | Download the desktop app |
| 48 | 11 | Desktop builds are unsigned until the project owner adds signing certificates. |
| 49 | 5 | Latest release: v0.1.9 for Linux |
| 50 | 3 | Download for Linux |
| 51 | 4 | Other platforms and checksums |
| 52 | 6 | Check diagram renders before you commit. |
| 53 | 1 | Terms |
| 54 | 4 | Built by Param Factory |
| 55 | 4 | v0.1.9 · Original generated artwork |

### README

| # | Words | Copy |
| ---: | ---: | --- |
| 1 | 3 | Diagram Source Studio |
| 2 | 9 | Catch Mermaid and D2 render changes before you commit. |
| 3 | 14 | Diagram Source Studio is a local-first workbench for engineers who keep diagrams in Git. *(jargon)* |
| 4 | 5 | Edit source beside its output. *(inconsistent “output”)* |
| 5 | 2 | Read diagnostics. |
| 6 | 5 | Compare Mermaid 10.9.8 with 11.17.2. |
| 7 | 8 | Export SVG or PNG with the source embedded. |
| 8 | 2 | Live site: |
| 9 | 2 | One-click demo: |
| 10 | 2 | What ships |
| 11 | 7 | Mermaid preview through two self-hosted renderer versions. *(jargon/inconsistent term)* |
| 12 | 9 | A compact D2 renderer for nodes, labels, and arrows. |
| 13 | 6 | Syntax diagnostics and an offline reference. |
| 14 | 9 | Native open and save dialogs in the Tauri app. |
| 15 | 9 | SVG and PNG export with embedded UTF-8 source metadata. |
| 16 | 10 | A demo that keeps sample edits separate from real data. |
| 17 | 9 | No telemetry, diagram upload, third-party fonts, or runtime CDN. *(jargon)* |
| 18 | 12 | The compact D2 renderer is intentionally smaller than the full D2 language. |
| 19 | 12 | Use Mermaid for diagrams that need shapes beyond nodes, labels, and arrows. |
| 20 | 5 | Free editor and Studio license |
| 21 | 11 | The free editor includes editing, diagnostics, single-version preview, and both exports. |
| 22 | 14 | Studio adds side-by-side Mermaid 10.9.8 and 11.17.2 comparison for a one-time $39 USD license. |
| 23 | 7 | Studio checkout is hosted by Dodo Payments. |
| 24 | 7 | After payment, checkout returns a license token. |
| 25 | 15 | The app saves it locally, removes it from the address, verifies it, and enables Studio. |
| 26 | 10 | Existing Studio licenses can also be pasted into the app. |
| 27 | 6 | Run the site and browser demo |
| 28 | 5 | Requirements: Node.js 22 and npm. |
| 29 | 2 | Open `http://127.0.0.1:4173/demo`. |
| 30 | 10 | The production site build lands at the work-order path `dist/site`: *(jargon)* |
| 31 | 4 | Run the desktop app |
| 32 | 12 | Install the current Tauri 2 system prerequisites, Rust, Node.js 22, and npm. |
| 33 | 2 | Then run: |
| 34 | 10 | Create a local platform bundle with `npm run tauri build`. |
| 35 | 12 | Release bundles are built on GitHub Actions, not in the factory worker. *(F-2-2)* |
| 36 | 11 | Linux users can install the checked AppImage from the latest release: |
| 37 | 9 | Windows users can run the SHA256-checking installer from PowerShell: *(F-2-2)* |
| 38 | 1 | Test |
| 39 | 11 | Playwright 1.58.2 runs each public claim from a clean browser context: |
| 40 | 13 | The live billing check confirms that the exact $39 USD product is present. |
| 41 | 10 | It also confirms that its Dodo-hosted checkout page responds successfully. |
| 42 | 8 | The browser suite tests a returned `license` token. |
| 43 | 7 | It confirms that Studio comparison becomes available. |
| 44 | 5 | The claim manifest is `.factory/claims.json`. |
| 45 | 5 | The demo contract is `.factory/demo.md`. |
| 46 | 3 | Privacy and security |
| 47 | 13 | Diagram contents stay on the device during the tested edit and export flow. |
| 48 | 6 | SVG output is parsed before display. *(inconsistent “output”)* |
| 49 | 11 | Scripts, links, embedded objects, event handlers, and external references are removed. |
| 50 | 10 | The landing page requests public release and purchase availability data. |
| 51 | 9 | It does not send diagram source with those requests. |
| 52 | 11 | A license check sends only the token you enter to `api.sociobot.in`. |
| 53 | 10 | Read the in-product `/privacy` and `/terms` routes for user-facing details. |
| 54 | 1 | Release |
| 55 | 12 | Push a `v*` tag or start Release desktop apps in GitHub Actions. |
| 56 | 11 | The workflow builds Linux, Windows, macOS arm64, and macOS x64 packages. *(F-2-2)* |
| 57 | 12 | It publishes matching SHA256 checksums and `latest.json` URLs with the GitHub Release. |
| 58 | 8 | Unsigned builds show the operating system's normal warning. |
| 59 | 9 | See `.factory/handoff.md` for signing secrets the operator must add. |
| 60 | 1 | License |
| 61 | 1 | MIT. |
| 62 | 2 | See `LICENSE`. |

## Demo and sandbox

PASS for the demo gate.

- One click on **Try it with sample data** opens `/?demo=1`; `/demo` also works directly.
- The first screen contains a 215-byte Mermaid architecture graph, a selected Mermaid language, editable source, and **“Syntax parsed. Preview rendered.”** It is already a used product state, not an empty setup screen.
- The persistent banner reads **“Demo — sample data, nothing is saved”** and includes **Reset demo** and **Start for real**.
- A `REAL-DO-NOT-TOUCH` sentinel in `real:diagram-source-studio:document` remained unchanged after editing, reset, SVG export, and exit. Reset restored the shipped source. No demo source or license was written into a real-data key.
- A fresh live `/demo` edit and export issued only same-origin GETs for the route, fonts, app assets, and the bundled Mermaid renderer. There were no request bodies and no off-origin requests.
- After the service worker controlled the page, a live offline reload succeeded. D2 source still produced **“Syntax parsed. Preview rendered.”**

## Claims and clean-clone verification

The clean clone was `/tmp/diagram-review-2.ng08nK` at commit `0433c4193d9c00d44bd298beb97fa185b754c7ac`. `npm ci` installed 186 packages with zero audit vulnerabilities. `npm test` dispatches each manifest command in a separate Playwright process; all passed. `npm run build` passed and emitted `dist/site/` with 13.10 kB gzip of main JavaScript.

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
| `release-installers` | PASS, but incomplete for the README wording in F-2-2 |
| `studio-purchase` | PASS |
| `billing-catalog` | PASS |
| `license-verdict-one-day` | PASS |
| `refund-revocation` | PASS |
| `no-sign-in` | PASS |
| `free-editor-diagnostics` | PASS |
| `startup-network` | PASS |
| `checkout-provider` | PASS |

No listed command failed. F-2-2 is a manifest-coverage defect: public subclaims are not asserted by the passing tagged test.

## Earlier findings rechecked

| Earlier finding | Live confirmation | Code/test confirmation | Status |
| --- | --- | --- | --- |
| F-1-1 | `/demo` and `/?demo=1` now show the compact home wordmark, Privacy, Terms, and the standard footer at 390 px and desktop. | `src/main.ts` wraps `editorView` with `header(true)` and `footer()`; the clean suite asserts both. | FIXED |
| F-1-2 | The narrowed landing statements and Dodo-hosted checkout wording are live. | `claims.json` now includes `no-sign-in`, `free-editor-diagnostics`, `startup-network`, and `checkout-provider`; all four tagged tests pass. | FIXED |
| F-1-3 | The four long README sentences were split. | The complete audit above has no sentence over 22 words. | FIXED |
| F-1-4 | The live headings are **Diagram renderer comparison**, **Privacy and product limits**, and **Download the desktop app**; README uses **Free editor and Studio license**. | The same strings are present in `src/main.ts` and `README.md`. | FIXED |

The polish-1 record and all verification/handoff files were also read. F-2-1 through F-2-4 are new round-2 findings, not renamed round-1 regressions.

## Structure, accessibility, routes, and links

| Check | Result and evidence |
| --- | --- |
| Titles and landmarks | PASS. `/`, `/demo`, `/privacy`, `/terms`, and the 404 have route-specific titles, `lang=en`, one h1, ordered headings, and a main landmark. |
| Metadata | PASS. Every tested route updates description, canonical, Open Graph and Twitter fields. The social image is 1200 × 630; favicon and 180 × 180 Apple icon load. |
| 404 | HTTP behavior and design PASS: an unknown URL returns 404 with the product's visual treatment and a working home action. Its wording fails F-2-4. |
| Deep links and history | PASS. Direct routes load. Navigating Home → Privacy and browser Back moved focus to the destination h1 each time. |
| Links | PASS. Every rendered user destination was crawled. Internal pages, the Dodo checkout redirect, release download, GitHub release, and Sociobot home returned 200; the deliberate unknown route returned 404. |
| Header and footer | PASS. All routes, including demo and 404, have the consistent wordmark/header and footer with Privacy and Terms. |
| Accessibility | PASS in the committed clean suite: Axe baselines, mobile pane keyboard access, skip-link order, 44 px targets, and route metadata tests all passed. No horizontal overflow appeared at 390 px. |
| Security and privacy | PASS for the inspected boundary. Live responses send CSP, `frame-ancestors 'none'`, nosniff, referrer, and permissions headers. The demo request log is same-origin only. |
| Visual identity | PASS. The neon repair-bench art, condensed display face, hyperlegible body face, clipped plates, cyan/magenta marks, and dark inspection layout match `.factory/design.md` and do not resemble a generic centered SaaS template. |

F-2-1 remains the only structural first-screen failure.

## Missed leverage

No finding. The brief's obvious leverage is import/open, renderer comparison, diagnostics, and editable SVG/PNG export; all are present. Sync or collaboration would conflict with the stated local job. Sending private diagram source to an AI gateway would not add an obviously necessary step, so an AI feature is not justified here.

## What would make this perfect

1. Fit the complete action/result/privacy/offline/price package above the fold at both required viewport sizes.
2. Prove the Windows checksum and advertised workflow/platform claims, or remove those claims.
3. Replace the remaining jargon and mixed terminology with the proposed plain wording; remove numbered eyebrow labels.
4. Make the 404 heading and recovery sentence literal while retaining its distinctive artwork.
