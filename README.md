# Diagram Source Studio

Catch Mermaid and D2 render changes before you commit.

Diagram Source Studio runs on your device for engineers who keep diagrams in Git. Edit source beside its render. Read diagnostics. Compare Mermaid 10.9.8 with 11.17.2. Export SVG or PNG renders with the source embedded.

Live site: <https://diagram-source-studio.sociobot.in><br>
One-click demo: <https://diagram-source-studio.sociobot.in/demo>

## What ships

- Mermaid preview through two bundled renderer versions.
- A compact D2 renderer for nodes, labels, and arrows.
- Syntax diagnostics and an offline reference.
- Native open and save dialogs in the Tauri app.
- SVG and PNG export with embedded UTF-8 source metadata.
- A demo that keeps sample edits separate from real data.
- No telemetry, diagram uploads, third-party fonts, or code loaded from another site.

The compact D2 renderer is intentionally smaller than the full D2 language. Use Mermaid for diagrams that need shapes beyond nodes, labels, and arrows.

## Free editor and Studio license

The free editor includes editing, diagnostics, one-version preview, and both exports. Studio adds a side-by-side comparison of Mermaid 10.9.8 and 11.17.2 for a one-time $39 USD license. Studio checkout is hosted by Dodo Payments. After payment, checkout returns a license token. The app saves it locally, removes it from the address, verifies it, and enables Studio. Existing Studio licenses can also be pasted into the app.

## Run the site and browser demo

Requirements: Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4173/demo`. The production site build is written to `dist/site`:

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

Create a local platform bundle with `npm run tauri build`. GitHub Actions builds release bundles.

Linux users can install the checked AppImage from the latest release:

```sh
curl -fsSL https://diagram-source-studio.sociobot.in/install.sh | sh
```

Windows users can run the SHA256-checking installer from PowerShell:

```powershell
irm https://diagram-source-studio.sociobot.in/install.ps1 | iex
```

## Test

Test requirements: Node.js 22, npm, a POSIX `sh`, `sha256sum`, PowerShell 7
(`pwsh`), and Chromium for Playwright. Install the browser after `npm ci`:

```sh
npx playwright install --with-deps chromium
```

Install PowerShell 7 from Microsoft's package for your operating system if
`pwsh --version` is unavailable. The test command checks these executables
before starting, so a missing prerequisite reports one setup error.

Playwright 1.58.2 runs each public claim from a clean browser context:

```sh
npm test
npm run test:live:billing
```

The live billing check confirms that the exact $39 USD product is present.
It also confirms that its Dodo-hosted checkout page responds successfully.
The browser suite tests a returned `license` token. It confirms that Studio
comparison becomes available.

The claim manifest is [`.factory/claims.json`](.factory/claims.json). The demo contract is [`.factory/demo.md`](.factory/demo.md).

## Privacy and security

Diagram contents stay on the device during the tested edit and export flow.
SVG renders are parsed before display. Scripts, links, embedded objects, event
handlers, and external references are removed. The landing page requests public
release and purchase availability data. It does not send diagram source with
those requests. A license check sends only the token you enter to
`api.sociobot.in`.

Read the in-product `/privacy` and `/terms` routes for user-facing details.

## Release

Set the same version in the npm, Cargo, and Tauri files. Then push its matching
`v*` tag, or start **Release desktop apps** on that commit in GitHub Actions.
The workflow rejects a mismatched tag, runs the complete browser suite, and
builds Linux, Windows, macOS arm64, and macOS x64 packages. It publishes
matching SHA256 checksums and `latest.json` URLs with the exact build commit.

Unsigned builds show the operating system's normal warning. See [`.factory/handoff.md`](.factory/handoff.md) for signing secrets the operator must add.

## License

MIT. See [`LICENSE`](LICENSE).
