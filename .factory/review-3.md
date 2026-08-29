# Adversarial first-read review 3 — PASS

Reviewed 2026-08-29 against repository commit `d7697755210314199dc2a86fb11943a487ff5e0d` and the live site at <https://diagram-source-studio.sociobot.in>. This was a read-only product review. No product code was changed.

## Verdict

**PASS.** There are zero findings. A cold visitor can state the job, audience, and first action without scrolling at both required sizes. The one-click demo is populated, isolated from real data, and recoverable. Every registered claim command passed from a clean clone, and no unlisted visitor-facing product claim was found after mapping the live copy and README to the manifest.

## Cold first read

Fresh browser contexts opened `/` at 390 × 844 and 1440 × 900 before scrolling or interacting.

| Viewport | What it does | For whom | First click | Result |
| --- | --- | --- | --- | --- |
| 390 × 844 | Checks Mermaid and D2 renders for changes before a commit. | Engineers who keep those diagram files in Git. | **Try it with sample data** | PASS |
| 1440 × 900 | Checks Mermaid and D2 renders for changes before a commit. | Engineers who keep those diagram files in Git. | **Try it with sample data** | PASS |

The exact first-screen copy is **“Catch broken diagram renders before commit”**, **“For engineers who keep Mermaid or D2 files in Git and need to inspect real output.”**, and **“Try it with sample data.”** The action result and all three facts are visible without scrolling: mobile bottom edges were 414 px (action), 480 px, 510 px, and 540 px (facts) in an 844 px viewport; desktop equivalents were 605 px, 687 px, 721 px, and 755 px in a 900 px viewport. No console or page error occurred in either context.

## Copy audit

Counts treat hyphenated words, versions, paths, and URLs as one word. Code samples, repeated navigation/footer text, and dynamically substituted version labels are excluded. All visitor-facing sentences, headings, labels, and actions are at or below 22 words. No banned marketing wording, contextless heading, non-informational slogan, inconsistent diagram term, or non-result-naming button was found.

### Landing page

| Words | Copy |
| ---: | --- |
| 3 | Diagram Source Studio |
| 1 | Demo |
| 1 | Download |
| 1 | Privacy |
| 3 | Diagram renderer comparison |
| 6 | Catch broken diagram renders before commit |
| 16 | For engineers who keep Mermaid or D2 files in Git and need to inspect real output. |
| 5 | Try it with sample data |
| 7 | Loads a Mermaid project in the browser. |
| 5 | Files stay on your device |
| 4 | Core editing works offline |
| 7 | Free editor · Studio is $39 once |
| 12 | A neon diagram on a repair bench has one broken magenta connection. (image alt) |
| 7 | Render difference found between two bundled versions |
| 6 | Inspect the render beside its source |
| 5 | Use the browser demo now. |
| 9 | Install the desktop app when you need native files. |
| 6 | Check a diagram in three steps |
| 3 | Open the source |
| 9 | Choose a Mermaid or D2 file from your repository. |
| 3 | Compare the renders |
| 8 | Place two bundled Mermaid versions side by side. |
| 4 | Export an editable file |
| 9 | Save SVG or PNG renders with the source embedded. |
| 4 | Privacy and product limits |
| 8 | No sign-in is required to use the editor. |
| 6 | Diagram source stays on your device. |
| 7 | Purchase availability checks the public catalog once. |
| 8 | License checks send only the token you enter. |
| 4 | Compare two Mermaid versions |
| 10 | The free editor previews, reports syntax problems, and exports diagrams. |
| 6 | Studio adds a side-by-side comparison. |
| 2 | Studio comparison |
| 3 | $39 once |
| 2 | One-time license. |
| 10 | After payment, checkout returns here and verifies your Studio access. |
| 2 | Buy Studio |
| 5 | Already have a Studio license? |
| 6 | Download the app to paste it. |
| 8 | Studio checkout is hosted by Dodo Payments. |
| 4 | Refunds revoke the license. |
| 5 | Download the desktop app |
| 10 | Desktop builds are unsigned until the project owner adds signing certificates. |
| 5 | Latest release: v0.1.10 for Linux |
| 3 | Download for Linux |
| 4 | Other platforms and checksums |
| 6 | Check diagram renders before you commit. |
| 4 | Built by Param Factory |
| 5 | v0.1.10 · Original generated artwork |

### README

| Words | Copy |
| ---: | --- |
| 3 | Diagram Source Studio |
| 9 | Catch Mermaid and D2 render changes before you commit. |
| 14 | Diagram Source Studio runs on your device for engineers who keep diagrams in Git. |
| 5 | Edit source beside its render. |
| 2 | Read diagnostics. |
| 5 | Compare Mermaid 10.9.8 with 11.17.2. |
| 9 | Export SVG or PNG renders with the source embedded. |
| 2 | Live site: |
| 2 | One-click demo: |
| 2 | What ships |
| 7 | Mermaid preview through two bundled renderer versions. |
| 9 | A compact D2 renderer for nodes, labels, and arrows. |
| 6 | Syntax diagnostics and an offline reference. |
| 9 | Native open and save dialogs in the Tauri app. |
| 9 | SVG and PNG export with embedded UTF-8 source metadata. |
| 10 | A demo that keeps sample edits separate from real data. |
| 12 | No telemetry, diagram uploads, third-party fonts, or code loaded from another site. |
| 12 | The compact D2 renderer is intentionally smaller than the full D2 language. |
| 12 | Use Mermaid for diagrams that need shapes beyond nodes, labels, and arrows. |
| 5 | Free editor and Studio license |
| 11 | The free editor includes editing, diagnostics, one-version preview, and both exports. |
| 16 | Studio adds a side-by-side comparison of Mermaid 10.9.8 and 11.17.2 for a one-time $39 USD license. |
| 8 | Studio checkout is hosted by Dodo Payments. |
| 7 | After payment, checkout returns a license token. |
| 15 | The app saves it locally, removes it from the address, verifies it, and enables Studio. |
| 10 | Existing Studio licenses can also be pasted into the app. |
| 6 | Run the site and browser demo |
| 5 | Requirements: Node.js 22 and npm. |
| 2 | Open `http://127.0.0.1:4173/demo`. |
| 8 | The production site build is written to `dist/site`. |
| 4 | Run the desktop app |
| 12 | Install the current Tauri 2 system prerequisites, Rust, Node.js 22, and npm. |
| 2 | Then run: |
| 10 | Create a local platform bundle with `npm run tauri build`. |
| 4 | GitHub Actions builds release bundles. |
| 11 | Linux users can install the checked AppImage from the latest release. |
| 9 | Windows users can run the SHA256-checking installer from PowerShell. |
| 1 | Test |
| 16 | Test requirements: Node.js 22, npm, a POSIX `sh`, `sha256sum`, PowerShell 7 (`pwsh`), and Chromium for Playwright. |
| 8 | Install the browser after `npm ci`. |
| 14 | Install PowerShell 7 if `pwsh --version` is unavailable. |
| 17 | The test command checks these executables before starting, so a missing prerequisite reports one setup error. |
| 10 | Playwright 1.58.2 runs each public claim from a clean browser context. |
| 13 | The live billing check confirms that the exact $39 USD product is present. |
| 10 | It also confirms that its Dodo-hosted checkout page responds successfully. |
| 8 | The browser suite tests a returned `license` token. |
| 7 | It confirms that Studio comparison becomes available. |
| 5 | The claim manifest is `.factory/claims.json`. |
| 5 | The demo contract is `.factory/demo.md`. |
| 3 | Privacy and security |
| 13 | Diagram contents stay on the device during the tested edit and export flow. |
| 6 | SVG renders are parsed before display. |
| 11 | Scripts, links, embedded objects, event handlers, and external references are removed. |
| 10 | The landing page requests public release and purchase availability data. |
| 9 | It does not send diagram source with those requests. |
| 11 | A license check sends only the token you enter to `api.sociobot.in`. |
| 10 | Read the in-product `/privacy` and `/terms` routes for user-facing details. |
| 1 | Release |
| 10 | Set the same version in the npm, Cargo, and Tauri files. |
| 17 | Then push its matching `v*` tag, or start Release desktop apps on that commit in GitHub Actions. |
| 22 | The workflow rejects a mismatched tag, runs the complete browser suite, and builds Linux, Windows, macOS arm64, and macOS x64 packages. |
| 13 | It publishes matching SHA256 checksums and `latest.json` URLs with the exact build commit. |
| 8 | Unsigned builds show the operating system's normal warning. |
| 11 | See `.factory/handoff.md` for signing secrets the operator must add. |
| 1 | License |
| 1 | MIT. |
| 2 | See `LICENSE`. |

The apparent long README release sentence is exactly the 22-word cap. Buttons are all result-naming verbs or clear destinations: **Try it with sample data**, **Open file**, **Save source**, **Export SVG**, **Export PNG**, **Reset demo**, **Start for real**, **Buy Studio**, and **Download for Linux**.

## Demo and sandbox

PASS.

- The landing action opens `/?demo=1` in one click; `/demo` is also a direct entry point.
- The first demo screen immediately shows a 215-byte Mermaid architecture flowchart, populated source, rendered preview, and **“Syntax parsed. Preview rendered.”** It also exposes source/preview pane controls, diagnostics, and export actions.
- The persistent banner reads **“Demo — sample data, nothing is saved”** and includes **Reset demo** and **Start for real**.
- I seeded `real:diagram-source-studio:document` with `REAL-DO-NOT-TOUCH`, edited the demo, reset it, and exited. The real sentinel was unchanged; Reset restored the shipped Mermaid source; direct `/demo` started with empty local storage.
- A fresh direct `/demo` request log contained only same-origin document, CSS, font, and application asset requests. It had no request body and no console or page error. The clean claim suite separately verifies offline reload after the first visit.

## Claims and clean-clone verification

PASS. I cloned the committed repository into `/tmp/diagram-review-3.FbLygL`, ran `npm ci` (186 packages, zero audit vulnerabilities), supplied the README-documented PowerShell 7 prerequisite in a temporary path because this container did not include `pwsh`, then ran `npm test`. The suite passed its 13 accessibility/route checks, 21 separately launched `@claim:` tests, and 4 regression checks. `npm run build` also passed and generated `dist/site/`; main JavaScript is 12.99 kB gzip and CSS is 4.65 kB gzip.

| Registered claim tests — all PASS |
| --- |
| `demo-sandbox`, `private-local`, `editable-export`, `renderer-matrix`, `d2-preview`, `offline-core`, `license-enforcement` |
| `native-file-dialogs`, `offline-reference`, `safe-svg`, `no-tracking`, `unsigned-builds`, `release-installers` |
| `studio-purchase`, `billing-catalog`, `license-verdict-one-day`, `refund-revocation`, `no-sign-in`, `free-editor-diagnostics` |
| `startup-network`, `checkout-provider` |

The live and README claims map to these entries: local/no-upload behavior to `private-local` and `no-tracking`; offline behavior to `offline-core`; demo isolation to `demo-sandbox`; render/version/D2 behavior to `renderer-matrix` and `d2-preview`; diagnostics and exports to `free-editor-diagnostics` and `editable-export`; licensing/purchase/refund language to `license-enforcement`, `studio-purchase`, `license-verdict-one-day`, `refund-revocation`, and `checkout-provider`; startup/catalog language to `startup-network` and `billing-catalog`; desktop/release wording to `native-file-dialogs`, `unsigned-builds`, and `release-installers`; and SVG safety to `safe-svg`. No unlisted claim remains.

## Earlier findings rechecked

I read every earlier `review-*.md`, `polish-*.md`, and the prior handoff. Each prior finding is fixed in both live behavior and current code/tests.

| Earlier finding | Current confirmation | Status |
| --- | --- | --- |
| F-1-1 | `/demo` has shared Home/Privacy/Terms navigation and the standard footer on mobile and desktop. | FIXED |
| F-1-2 | Claim manifest now covers the listed local, diagnostics, startup-network, and Dodo checkout promises. | FIXED |
| F-1-3 | No current README sentence exceeds 22 words. | FIXED |
| F-1-4 | Current headings name the comparison, privacy, download, and license sections directly. | FIXED |
| F-2-1 | The full first-screen action/result/facts package fits at both required viewports. | FIXED |
| F-2-2 | The release claim test checks the four-platform workflow and matching/mismatched shell and PowerShell checksum paths. | FIXED |
| F-2-3 | The current copy uses source, render, and side-by-side comparison consistently; decorative eyebrows are absent. | FIXED |
| F-2-4 | The live 404 says **“Page not found”** and gives the literal home-page recovery instruction. | FIXED |

## Structure, privacy, accessibility, and links

- `/`, `/demo`, `/privacy`, and `/terms` returned 200. An unknown route returned the designed 404 with HTTP 404. Each route has `lang=en`, exactly one h1, a main landmark, an appropriate route title/description/canonical, Open Graph/Twitter image metadata, favicon, shared header, and shared footer.
- The direct routes, client-side navigation, and browser Back work. On live navigation to Privacy and Back to Home, focus moved to the destination h1 in both cases.
- Live Axe scans at 390 px reported zero serious or critical violations for `/`, `/demo`, `/privacy`, `/terms`, and the 404. The clean suite also covers keyboard pane access, skip-link order, touch targets, responsive layout, and reduced motion.
- Every rendered destination was crawled. Same-origin pages, the Dodo hosted checkout, the Linux release asset, the GitHub release page, and sociobot.in all returned 200; in-page links were valid anchors.
- The live response sends CSP with `frame-ancestors 'none'` as a header, plus nosniff, strict referrer policy, and permissions policy. Demo requests remain same-origin. The landing's disclosed GitHub and Sociobot public availability GETs contain no diagram source.
- The night-market neon workbench treatment, original inspection artwork, type pairing, clipped controls, cyan/magenta diagnostic marks, and non-centered composition match `.factory/design.md` and remain distinct from a generic SaaS template.

## Missed leverage

No finding. The brief implies local file open/import, renderer comparison, diagnostics, and editable export; each is present. Collaboration or sync would dilute the local-first job, and sending private diagram source to an AI gateway is not an obviously valuable step for this renderer-verification workflow.

## What would make this perfect

Nothing product-critical remains. Preserve the tested demo isolation, precise claims-to-tests mapping, plain copy, and route/accessibility behavior as future release work changes the desktop app or billing integration.
