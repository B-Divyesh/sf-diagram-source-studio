# Polish round 2

Base review: [`review-2.md`](review-2.md), commit `f9a7907fb81702ea13cb0b05ad3354ccabf5ea27`.
Repair implementation: `3e9f2783f8d97bd6bf35de1343e9ac12c9dda711`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the shared compact header, legal links, demo banner, Reset demo, Start for real action, and footer on both `/?demo=1` and `/demo`. | `demo keeps the shared home, legal navigation, and footer at its direct entry point`; live [mobile demo](polish-artifacts-2/live-demo/screenshot-mobile.png); live `/?demo=1` recheck in `live-recheck.json`. |
| F-1-2 | Kept the earlier narrowed, testable privacy/payment copy and its four claims: no sign-in, diagnostics/recovery, startup network boundary, and Dodo checkout provider. | `@claim:no-sign-in`, `@claim:free-editor-diagnostics`, `@claim:startup-network`, and `@claim:checkout-provider` all passed in the clean clone. |
| F-1-3 | Kept the README sentences split into short, single-purpose sentences. | Updated [`copy-audit.md`](copy-audit.md); all audited landing sentences are 22 words or fewer. |
| F-1-4 | Kept the plain landing and README headings from round 1. | Accessibility route suite passed; landing copy audit lists the current headings. |
| F-2-1 | Reduced hero type and vertical spacing while retaining the asymmetric neon workbench composition. Added an exact browser assertion that the action, result, and each of the three facts fit inside both 1440×900 and 390×844 viewports. | `landing complete first-screen package fits at required desktop and mobile viewports`; live desktop/mobile bounds in `live-recheck.json` (755/900 and 540/844); [live mobile screenshot](polish-artifacts-2/live-root/screenshot-mobile.png). |
| F-2-2 | Expanded the release claim and test. The test generates a five-platform manifest, inspects the GitHub Actions Linux/Windows/macOS-arm64/macOS-x64 matrix, runs `install.sh`, and runs `install.ps1` through both matching and mismatched temporary HTTP release fixtures. | `@claim:release-installers workflow builds four platforms and both installers refuse bad checksums` passed in the clean clone. |
| F-2-3 | Replaced jargon with bundled versions, renders, and side-by-side comparison; removed every numbered decorative eyebrow from the landing and editor; rewrote README language; updated metadata and the catalog sentence. | `copy-audit.md`; `accessibility baseline for /`; live root screenshot and metadata check in `live-root/verify.json`. |
| F-2-4 | Rewrote the designed 404 to say “Page not found” and “This page does not exist. Return to the home page.” while retaining the broken-neon sign and recovery action. | `404 names the missing page plainly`; live assertions in `live-recheck.json`; [live 404 screenshot](polish-artifacts-2/live-404/screenshot-mobile.png). |

## Verification before deployment

- Clean clone: `/tmp/diagram-source-studio-polish-2.hnMZFk` at `3e9f2783f8d97bd6bf35de1343e9ac12c9dda711`.
- `npm ci`: passed, 186 packages, 0 audit vulnerabilities.
- `npm test`: passed. This dispatches every `@claim:` command in `.factory/claims.json` from fresh Playwright processes, plus all accessibility and regression checks.
- `npm run build:site`: passed; `dist/site/` produced. Main JavaScript was 12.98 kB gzip and CSS was 4.65 kB gzip.
- Local visual checks: desktop landing, 390 px landing/demo, and 390 px 404 screenshots linked above.

## Deployment recheck

Deployed through `/opt/fleet/lib/deploy-static.sh diagram-source-studio dist/site` to `https://diagram-source-studio.sociobot.in` (Azure Static Web Apps deployment `69444b68-7f81-46f4-bcb6-e16bd3f74e2c`). Fresh live checks passed:

- `verify-url.sh` passed for `/` and `/?demo=1`: title, `lang`, one h1, main landmark, image alt text, and no console errors. Evidence: `live-root/verify.json`, `live-demo/verify.json`.
- Live 390 px Axe scans of `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and `/does-not-exist` found no serious or critical violations. Evidence: `live-axe.json`.
- The direct cold recheck confirmed the complete first-screen package at both required viewports, demo isolation controls and legal navigation, and literal 404 recovery. Evidence: `live-recheck.json`.
