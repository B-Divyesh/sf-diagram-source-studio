# Demo sandbox

- URL: `https://diagram-source-studio.sociobot.in/?demo=1` or local `http://127.0.0.1:4173/?demo=1`. `/demo` is also a direct demo route.
- Sample: a Mermaid flowchart sends one source through Mermaid 11.17.2 and 10.9.8, with a marked missing-arc path before export.
- Reset: select **Reset demo** in the persistent demo banner.
- Leave: select **Start for real**. Demo edits are discarded.
- Storage: demo source and license state stay in memory. Demo mode never reads or writes `real:diagram-source-studio:*` or `sb_license:*` local storage.
- Verification: `npm test` starts the site and exercises claims from fresh browser contexts.
