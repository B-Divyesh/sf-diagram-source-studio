import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    outDir: 'dist/site',
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        demo: resolve(import.meta.dirname, 'demo.html'),
        privacy: resolve(import.meta.dirname, 'privacy.html'),
        terms: resolve(import.meta.dirname, 'terms.html'),
        notFound: resolve(import.meta.dirname, '404.html')
      }
    }
  },
  server: { port: 4173, strictPort: true }
});
