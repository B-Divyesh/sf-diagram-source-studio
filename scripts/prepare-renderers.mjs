import { copyFileSync, mkdirSync } from 'node:fs';
mkdirSync('public/vendor', { recursive: true });
copyFileSync('node_modules/mermaid10/dist/mermaid.min.js', 'public/vendor/mermaid-10.min.js');
copyFileSync('node_modules/mermaid11/dist/mermaid.min.js', 'public/vendor/mermaid-11.min.js');
