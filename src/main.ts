import './styles.css';
import { editorView, mountEditor } from './editor';
import { captureLicense, checkoutUrl } from './license';

const app = document.querySelector<HTMLElement>('#app')!;
const isNative = () => '__TAURI_INTERNALS__' in window;

const routes: Record<string, { title: string; description: string }> = {
  '/': { title: 'Diagram Source Studio — check diagram renders', description: 'Compare Mermaid and D2 render output before you commit, then export files that keep their source.' },
  '/demo': { title: 'Demo — Diagram Source Studio', description: 'Try Diagram Source Studio with a sample Mermaid project.' },
  '/privacy': { title: 'Privacy — Diagram Source Studio', description: 'How Diagram Source Studio handles local files and license checks.' },
  '/terms': { title: 'Terms — Diagram Source Studio', description: 'Terms for Diagram Source Studio and its one-time license.' },
  '/404': { title: 'Page not found — Diagram Source Studio', description: 'Return to Diagram Source Studio.' }
};

function header(): string {
  return `<header class="site-header"><a class="wordmark" href="/" data-link aria-label="Diagram Source Studio home"><span class="mark" aria-hidden="true">D<span></span>S</span><b>Diagram Source Studio</b></a><nav aria-label="Main navigation"><a href="/demo" data-link>Demo</a><a href="#downloads">Download</a><a href="/privacy" data-link>Privacy</a></nav></header>`;
}

function footer(): string {
  return `<footer class="site-footer"><p><strong>Diagram Source Studio</strong><br>Check diagram renders before you commit.</p><nav aria-label="Footer navigation"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></nav><p class="build">v0.1.2 · Original generated artwork</p></footer>`;
}

function home(): string {
  return `${header()}<main id="main">
    <section class="hero">
      <div class="hero-copy"><p class="eyebrow">Renderer inspection workbench</p><h1 tabindex="-1">Catch broken diagram renders before commit</h1><p class="lede">For engineers who keep Mermaid or D2 files in Git and need to inspect real output.</p><div class="hero-actions"><a class="primary" href="/demo" data-link>Try it with sample data</a><span>Loads a Mermaid project in the browser.</span></div><ul class="plain-facts"><li>Files stay on your device</li><li>Core editing works offline</li><li>Free editor · Studio is $39 once</li></ul></div>
      <figure class="hero-art"><picture><source media="(max-width: 640px)" srcset="/assets/neon-inspection-640.webp"><img src="/assets/neon-inspection-1280.webp" width="1536" height="1024" fetchpriority="high" alt="A neon diagram on a repair bench has one broken magenta connection." /></picture><figcaption><span class="signal magenta"></span> Render difference found between two bundled versions</figcaption></figure>
    </section>
    <section class="live-preview" aria-labelledby="preview-title"><div class="section-intro"><p class="eyebrow">01 / the product</p><h2 id="preview-title">Inspect the output beside its source</h2><p>Use the browser demo now. Install the desktop app when you need native files.</p></div><div class="mini-workbench" aria-label="Diagram Source Studio preview"><div class="mini-source"><div class="mini-bar"><span>architecture.mmd</span><span>UTF-8</span></div><pre><span>flowchart LR</span>
  source[Diagram source]
  source --> current{11.17.2}
  source --> previous{10.9.8}
  <mark>previous -. missing .-> check</mark></pre></div><div class="mini-canvas"><svg viewBox="0 0 620 300" role="img" aria-label="Two renderer paths meet at an inspection node, while a magenta path is broken."><defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g class="diagram-lines" fill="none" stroke-width="4" filter="url(#glow)"><path stroke="#36f1e4" d="M120 150H240M380 85H495M120 150C170 150 180 85 240 85"/><path stroke="#ff4fa3" stroke-dasharray="22 14" d="M120 150C170 150 180 225 240 225M380 225H430"/></g><g fill="#19202a" stroke="#36f1e4" stroke-width="2"><rect x="20" y="115" width="100" height="70"/><rect x="240" y="50" width="140" height="70"/><rect x="240" y="190" width="140" height="70"/><rect x="495" y="115" width="105" height="70"/></g><g fill="#f5f1e8" font-size="17" text-anchor="middle"><text x="70" y="157">source</text><text x="310" y="92">11.17.2</text><text x="310" y="232">10.9.8</text><text x="548" y="157">inspect</text></g><circle cx="459" cy="225" r="10" fill="#ff4fa3"/></svg><span class="canvas-status"><i></i> 1 output difference</span></div></div></section>
    <section class="walkthrough" aria-labelledby="how-title"><div class="section-intro"><p class="eyebrow">02 / how it works</p><h2 id="how-title">Check a diagram in three steps</h2></div><ol><li><div class="step-frame source-frame" aria-hidden="true"><span>architecture.mmd</span><code>service --&gt; database</code></div><h3>Open the source</h3><p>Choose a Mermaid or D2 file from your repository.</p></li><li><div class="step-frame compare-frame" aria-hidden="true"><span>11.17.2 ✓</span><span>10.9.8 !</span></div><h3>Compare the renders</h3><p>Place two bundled Mermaid versions side by side.</p></li><li><div class="step-frame export-frame" aria-hidden="true"><span>&lt;metadata&gt;</span><b>SVG</b><b>PNG</b></div><h3>Export an editable file</h3><p>Save SVG or PNG output with the source embedded.</p></li></ol></section>
    <section class="boundary" aria-labelledby="boundary-title"><div><p class="eyebrow">03 / clear boundary</p><h2 id="boundary-title">Your diagrams do not become a service</h2></div><div><p>The editor has no accounts, hosting, collaboration, analytics, or AI generation.</p><p>Source stays local. A license check sends only the token you enter.</p></div></section>
    <section class="pricing" aria-labelledby="price-title"><div><p class="eyebrow">04 / one-time license</p><h2 id="price-title">Compare both bundled Mermaid versions</h2><p>The free editor previews, diagnoses, and exports diagrams. Studio adds the side-by-side renderer matrix.</p></div><div class="price-plate"><span>Studio license</span><strong>$39</strong><small>One-time purchase</small><a class="primary" href="${checkoutUrl}">Buy Studio</a><a href="#restore">Already bought it? Paste your license in the app.</a><p>Sociobot/Dodo is the merchant of record. Refunds are handled there.</p></div></section>
    <section class="downloads" id="downloads" aria-labelledby="download-title"><div><p class="eyebrow">05 / desktop app</p><h2 id="download-title">Install it beside your repository</h2><p>Desktop builds are unsigned until the project owner adds signing certificates.</p></div><div id="download-panel" class="download-panel" aria-live="polite"><span class="tube-dots" aria-hidden="true"><i></i><i></i><i></i></span><p>Checking the latest release…</p></div></section>
  </main>${footer()}`;
}

const legalHeader = (eyebrow: string, heading: string, intro: string) => `${header()}<main id="main" class="legal"><p class="eyebrow">${eyebrow}</p><h1 tabindex="-1">${heading}</h1><p class="lede">${intro}</p>`;

function privacy(): string {
  return `${legalHeader('Privacy / updated 28 August 2026', 'Your source stays on your device', 'Diagram Source Studio reads files you choose and does not upload their contents.')}
  <h2>Files and local storage</h2><p>The browser demo keeps sample changes in memory. The real editor may store your last open source in local storage. You can clear site data at any time.</p>
  <h2>License checks</h2><p>If you enter a license, the app sends that token to the Sociobot billing API. It stores the result for one day. Diagram source is not included.</p>
  <h2>Network use</h2><p>The editor loads its code, fonts, and sample from this site. It makes no analytics or advertising requests. The download panel requests public release data from GitHub.</p>
  <h2>Your choices</h2><p>Use the free editor without a license. Remove local data through your browser or operating system.</p></main>${footer()}`;
}

function terms(): string {
  return `${legalHeader('Terms / updated 28 August 2026', 'Use the editor for work you control', 'These terms cover the app, browser demo, and one-time Studio license.')}
  <h2>License</h2><p>The source code is available under the MIT License. A Studio purchase grants one person use of paid app features on their devices.</p>
  <h2>Purchases and refunds</h2><p>Sociobot/Dodo is the merchant of record. Its checkout handles payment and refunds. A refunded license stops working.</p>
  <h2>Your files</h2><p>You keep all rights to your source and exports. You are responsible for files you open and share.</p>
  <h2>No warranty</h2><p>The software is provided without warranty. Review important render output before publishing it.</p></main>${footer()}`;
}

function notFound(): string {
  return `${header()}<main id="main" class="not-found"><div class="broken-sign" aria-hidden="true"><span>4</span><i></i><span>4</span></div><h1 tabindex="-1">This diagram path is not connected</h1><p>The page does not exist. Return to the workbench entrance.</p><a class="primary" href="/" data-link>Return home</a></main>${footer()}`;
}

async function setupDownloads() {
  const panel = document.querySelector<HTMLElement>('#download-panel');
  if (!panel) return;
  const fallback = () => panel.innerHTML = `<p>Downloads are being published.</p><a class="secondary-button" href="https://github.com/B-Divyesh/sf-diagram-source-studio/releases">View the release page <span class="sr-only">(external site)</span></a>`;
  try {
    const cacheKey = 'release:diagram-source-studio';
    const cached = JSON.parse(localStorage.getItem(cacheKey) ?? 'null');
    let release = cached?.expires > Date.now() ? cached.data : null;
    if (!release) {
      const response = await fetch('https://api.github.com/repos/B-Divyesh/sf-diagram-source-studio/releases?per_page=1');
      if (!response.ok) throw new Error('release unavailable');
      const releases = await response.json();
      release = releases[0];
      if (!release) throw new Error('release unavailable');
      localStorage.setItem(cacheKey, JSON.stringify({ expires: Date.now() + 3_600_000, data: release }));
    }
    const platform = /Windows/i.test(navigator.userAgent) ? 'windows' : /Mac/i.test(navigator.userAgent) ? 'macOS' : 'Linux';
    const match = release.assets?.find((asset: { name: string }) => platform === 'windows' ? /\.(msi|exe)$/i.test(asset.name) : platform === 'macOS' ? /\.(dmg|app\.tar\.gz)$/i.test(asset.name) : /\.(AppImage|deb)$/i.test(asset.name));
    if (!match) return fallback();
    panel.innerHTML = `<p>Latest release: ${escapeHtml(release.tag_name)} for ${platform}</p><a class="primary" href="${match.browser_download_url}">Download for ${platform}</a><a href="${release.html_url}">Other platforms and checksums <span class="sr-only">(external site)</span></a>`;
  } catch { fallback(); }
}

function renderRoute(path = location.pathname, push = false) {
  let route = routes[path] ? path : '/404';
  if (isNative()) route = '/demo';
  if (push) history.pushState({}, '', path);
  const metadata = routes[route];
  document.title = metadata.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description);
  if (route === '/') app.innerHTML = home();
  else if (route === '/demo') app.innerHTML = editorView(!isNative());
  else if (route === '/privacy') app.innerHTML = privacy();
  else if (route === '/terms') app.innerHTML = terms();
  else app.innerHTML = notFound();
  if (route === '/demo') mountEditor(!isNative());
  if (route === '/') setupDownloads();
  requestAnimationFrame(() => document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: !push }));
  document.querySelector<HTMLElement>('#route-announcer')?.remove();
  const announcer = document.createElement('div'); announcer.id = 'route-announcer'; announcer.className = 'sr-only'; announcer.setAttribute('aria-live', 'polite'); announcer.textContent = metadata.title; document.body.append(announcer);
  if (push) scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

captureLicense();
document.addEventListener('click', (event) => {
  const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-link]');
  if (!anchor || anchor.origin !== location.origin) return;
  event.preventDefault(); renderRoute(anchor.pathname, true);
});
addEventListener('popstate', () => renderRoute());
renderRoute();

if ('serviceWorker' in navigator && !isNative()) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] ?? character));
