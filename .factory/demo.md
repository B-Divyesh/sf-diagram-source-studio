# Demo sandbox

- URL: `https://diagram-source-studio.sociobot.in/demo` or local `http://127.0.0.1:4173/demo`.
- Sample: a Mermaid flowchart sends one source through Mermaid 11.12 and 10.9, with a marked missing-arc path before export.
- Reset: select **Reset demo** in the persistent demo banner.
- Leave: select **Start for real**. Demo edits are discarded.
- Storage: demo source stays in memory. It never reads or writes the `real:diagram-source-studio:*` local-storage namespace.
- Verification: `npm test` starts the site and exercises claims from fresh browser contexts.
