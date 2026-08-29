# Polish 2 handoff — deployed and rechecked

Repair commit: `3e9f2783f8d97bd6bf35de1343e9ac12c9dda711` (based on review commit `f9a7907fb81702ea13cb0b05ad3354ccabf5ea27`).

## What changed

- Made the complete first-screen package fit at 1440×900 and 390×844 without replacing the night-market neon inspection identity.
- Removed remaining jargon, mixed renderer terminology, and numbered decorative labels from the landing, editor, README, metadata, and catalog description.
- Made the 404 literal while retaining the original broken-neon artwork.
- Expanded the release claim proof to cover the GitHub Actions target matrix plus real PowerShell success and checksum-rejection fixtures.
- Preserved the isolated `?demo=1` / `/demo` sample workflow, persistent banner, Reset demo, Start for real action, shared legal navigation, routes, focus behavior, privacy boundary, and desktop-app release class.

## Run and verify

```sh
npm ci
npm test
npm run build:site
```

The static site is written to `dist/site`. `npm test` runs every claim declared in `.factory/claims.json`, the accessibility suite, mobile keyboard checks, route/metadata checks, the first-screen viewport assertion, and regressions. The PowerShell claim test requires `pwsh`; it is available on the GitHub Actions Ubuntu runner and was installed locally for this verification.

## Exact evidence

- Clean clone: `/tmp/diagram-source-studio-polish-2.hnMZFk` at `3e9f2783f8d97bd6bf35de1343e9ac12c9dda711`.
- `npm ci` passed with 186 packages and 0 audit vulnerabilities.
- `npm test` passed: all 21 claims, 13 accessibility checks, and regressions.
- `npm run build:site` passed. `dist/site` contains the static routes and build assets; main JavaScript is 12.98 kB gzip and CSS is 4.65 kB gzip.
- Local visual evidence: `.factory/polish-artifacts-2/local-root-desktop.png`, `local-root-mobile.png`, `local-demo-mobile.png`, and `local-404-mobile.png`.

The full finding-to-evidence map is in [`.factory/polish-2.md`](polish-2.md).

## Deployment and known gaps

Deployed `dist/site` through the static work-order configuration to `https://diagram-source-studio.sociobot.in` (Azure Static Web Apps deployment `69444b68-7f81-46f4-bcb6-e16bd3f74e2c`). Cold live checks passed for `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and `/does-not-exist`:

- `verify-url.sh` passed for the landing and demo with no page or console errors.
- Live Axe scans found zero serious or critical issues on every route above.
- The landing’s complete action/result/fact package ended at 755 px on 1440×900 and 540 px on 390×844.
- The live demo showed the persistent banner, Reset demo, Start for real, Privacy, Terms, and footer. The live 404 showed the literal heading and recovery sentence.

Evidence lives in `.factory/polish-artifacts-2/live-root/verify.json`, `live-demo/verify.json`, `live-axe.json`, and `live-recheck.json`. No product defects are known. Desktop release bundles remain intentionally unsigned until the operator adds `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` to GitHub Actions; the app discloses that state before download.
