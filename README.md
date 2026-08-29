# Diagram Source Studio

Catch Mermaid and D2 render changes before you commit.

Diagram Source Studio is a local-first workbench for engineers who keep diagrams in Git. Edit source beside its real output, read diagnostics, compare bundled Mermaid 10.9.8 and 11.17.2 renderers, and export SVG or PNG files that preserve the source byte for byte.

Live site: <https://diagram-source-studio.sociobot.in><br>
One-click demo: <https://diagram-source-studio.sociobot.in/demo>

## What ships

- Mermaid preview through two self-hosted renderer versions.
- A compact D2 renderer for nodes, labels, and arrows.
- Syntax diagnostics and an offline reference.
- Native open and save dialogs in the Tauri app.
- SVG and PNG export with embedded UTF-8 source metadata.
- A demo that keeps sample edits separate from real data.
- No telemetry, diagram upload, third-party fonts, or runtime CDN.

The compact D2 renderer is intentionally smaller than the full D2 language. Use Mermaid for diagrams that need shapes beyond nodes, labels, and arrows.

## Free and Studio

The free editor includes editing, diagnostics, single-version preview, and both exports. Studio adds side-by-side Mermaid 10.9.8 and 11.17.2 comparison for a one-time $39 USD license. Sociobot/Dodo is the merchant of record. After payment, checkout returns to the product with a license token; the app stores it locally, removes it from the address, verifies it with Sociobot, and enables Studio. Existing Studio licenses can also be pasted into the app.

## Run the site and browser demo

Requirements: Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4173/demo`. The production site build lands at the work-order path `dist/site`:

```sh
npm run build:site
npm run preview
```

## Run the desktop app

Install the current Tauri 2 system prerequisites, Rust, Node.js 22, and npm. Then run:

```sh
npm ci
npm run tauri dev
```

Create a local platform bundle with `npm run tauri build`. Release bundles are built on GitHub Actions, not in the factory worker.

Linux users can install the checked AppImage from the latest release:

```sh
curl -fsSL https://diagram-source-studio.sociobot.in/install.sh | sh
```

Windows users can run the SHA256-checking installer from PowerShell:

```powershell
irm https://diagram-source-studio.sociobot.in/install.ps1 | iex
```

## Test

Playwright 1.58.2 runs each public claim from a clean browser context:

```sh
npm test
npm run test:live:billing
```

The live billing check confirms that the exact $39 USD product is present and
that its Dodo-hosted checkout page responds successfully. The browser suite
records the completed browser contract: a returned `license` token is saved,
removed from the URL, verified, and enables both Studio comparison panels.

The claim manifest is [`.factory/claims.json`](.factory/claims.json). The demo contract is [`.factory/demo.md`](.factory/demo.md).

## Privacy and security

Diagram contents stay on the device during the tested edit and export flow. Renderer scripts and fonts ship with the app. SVG output is parsed before display; scripts, links, embedded objects, event handlers, and external references are removed. The app checks Sociobot's public catalog once to show whether Studio is available; a license check sends only the token you enter to `api.sociobot.in`.

Read the in-product `/privacy` and `/terms` routes for user-facing details.

## Release

Push a `v*` tag or start **Release desktop apps** in GitHub Actions. The workflow builds Linux, Windows, macOS arm64, and macOS x64 packages. It publishes matching SHA256 checksums and `latest.json` URLs with the GitHub Release.

Unsigned builds show the operating system's normal warning. See [`.factory/handoff.md`](.factory/handoff.md) for signing secrets the operator must add.

## License

MIT. See [`LICENSE`](LICENSE).
