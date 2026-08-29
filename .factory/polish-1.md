# Polish round 1

Base review: [`review-1.md`](review-1.md), commit `bbaf1788c7962ac3fe6b9da1035afb07dd85314c`.
Repair commit deployed: `c1259cf27ebe30112fb07b1d8b4bb0c2bf9eb962`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Put the sample editor inside the shared compact site header and standard footer. The header exposes Home through the wordmark plus Privacy and Terms. The primary action now opens the isolated `/?demo=1` entry point; `/demo` remains direct. Mobile keeps 44 px legal links and hides the duplicate editor wordmark. | `npm test` → `demo keeps the shared home, legal navigation, and footer at its direct entry point`; live [`/?demo=1`](https://diagram-source-studio.sociobot.in/?demo=1), [desktop screenshot](polish-artifacts-1/live-demo/screenshot-desktop.png), [mobile screenshot](polish-artifacts-1/live-demo/screenshot-mobile.png). |
| F-1-2 | Added four observable claims and tagged tests: `no-sign-in`, `free-editor-diagnostics`, `startup-network`, and `checkout-provider`. Narrowed the prior untestable inventory assertion to the tested no-sign-in/local-source boundary. Replaced the merchant wording with the recorded, testable Dodo-hosted checkout fact. The diagnostics test proves malformed Mermaid gives a useful error, **Load working sample** recovers, and SVG exports. The startup test records only GitHub release and Sociobot catalog GETs with no source body. | Every command listed in `.factory/claims.json` passed from `/tmp/diagram-source-studio-clean.jin7hs`; `npm run test:live:billing` reported `checkout_host: checkout.dodopayments.com`; live demo reset and Start for real check passed with no console errors. |
| F-1-3 | Split all four flagged README sentences into short, single-purpose sentences. | README and updated [`copy-audit.md`](copy-audit.md); review wording now has no sentence over 22 words. |
| F-1-4 | Renamed the four flagged headings to **Diagram renderer comparison**, **Privacy and product limits**, **Download the desktop app**, and **Free editor and Studio license**. | Live [landing page](https://diagram-source-studio.sociobot.in/); [cold mobile screenshot](polish-artifacts-1/live-root/screenshot-mobile.png); `npm test` route and accessibility checks passed. |

No earlier `.factory/review-*.md` or `.factory/polish-*.md` records existed before `review-1.md`; `git log --all -- .factory/review-*.md .factory/polish-*.md` confirms that this is the first tracked polish round.

## Live recheck

Fresh 390 px browser contexts opened the live landing and then the primary action. The live action reached `/?demo=1`; the populated sample, banner, Reset demo, Start for real, compact legal navigation, and footer all appeared. Reset restored the shipped sample; Start for real returned to the landing page. No console or page errors appeared.

`verify-url.sh` recorded clean title, language, main landmark, alt text, and console results at both live routes. Live Axe scans at 390 px found zero serious or critical violations on `/`, `/?demo=1`, `/privacy`, and `/terms`. Lighthouse against the live landing recorded Performance 100, Accessibility 100, Best Practices 100, and SEO 100.
