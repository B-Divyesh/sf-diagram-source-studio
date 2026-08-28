import { embedSourceInPng, embedSourceInSvg, Engine, renderDiagram, RendererVersion, sourceFromPng, sourceFromSvg } from './diagram';
import { checkoutUrl, localLicenseState, saveLicense, verifyLicense } from './license';

const MERMAID_SAMPLE = `flowchart LR
  source[Diagram source] --> current{Mermaid 11.17.2}
  source --> previous{Mermaid 10.9.8}
  current --> check[Compare output]
  previous -. missing arc .-> check
  check --> export[Export with source]`;

const D2_SAMPLE = `direction: right
source: Diagram source
current: D2 compact
check: Inspect output
export: Export with source
source -> current: render
current -> check: compare
check -> export: keep source`;

const isNative = () => '__TAURI_INTERNALS__' in window;

function download(data: BlobPart, type: string, name: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function nativeInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T | null> {
  if (!isNative()) return null;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<T>(command, args);
  } catch { return null; }
}

export function editorView(demo: boolean): string {
  return `<div class="studio-shell ${demo ? 'is-demo' : ''}">
    ${demo ? `<aside class="demo-banner" aria-label="Demo status"><strong>Demo — sample data, nothing is saved</strong><span><button class="text-button" data-action="reset-demo">Reset demo</button><a href="/" data-link>Start for real</a></span></aside>` : ''}
    <header class="app-header">
      <a class="wordmark" href="/" data-link aria-label="Diagram Source Studio home"><span class="mark" aria-hidden="true">D<span></span>S</span><b>Diagram Source Studio</b></a>
      <nav aria-label="Editor actions">
        <button data-action="open">Open file</button><button data-action="save">Save source</button>
        <button class="primary small" data-action="export-svg">Export SVG</button><button data-action="export-png">Export PNG</button>
      </nav>
    </header>
    <main id="main" class="studio-main">
      <h1 class="sr-only" tabindex="-1">Check diagram render output</h1>
      <aside class="studio-rail" aria-label="Diagram settings">
        <div class="rail-section">
          <p class="eyebrow">01 / source</p>
          <label for="engine">Diagram language</label>
          <select id="engine"><option value="mermaid">Mermaid</option><option value="d2">D2</option></select>
          <button data-action="load-sample">Load sample project</button>
        </div>
        <div class="rail-section diagnostics">
          <p class="eyebrow">02 / inspection</p>
          <h2>Diagnostics</h2>
          <div id="diagnostics" class="status pending" aria-live="polite">Waiting for the renderer.</div>
        </div>
        <details class="rail-section reference">
          <summary>Offline syntax reference</summary>
          <div id="reference-copy"><code>flowchart LR</code><p>Use <code>A --&gt; B</code> for an arrow.</p><p>Use <code>A[Label]</code> for a named node.</p></div>
        </details>
        <div class="rail-section license-panel">
          <p class="eyebrow">03 / license</p>
          <div id="license-state">Checking local license…</div>
          <details><summary>Have a license?</summary><label for="license-token">License token</label><input id="license-token" autocomplete="off" /><button data-action="restore-license">Verify license</button></details>
        </div>
      </aside>
      <section class="workbench">
        <div class="mobile-tabs" role="tablist" aria-label="Editor panes"><button role="tab" aria-selected="true" data-pane="source">Source</button><button role="tab" aria-selected="false" data-pane="preview">Preview</button></div>
        <section class="source-pane" data-pane-content="source" aria-labelledby="source-heading">
          <div class="pane-heading"><h2 id="source-heading">Source</h2><span id="byte-count">0 bytes</span></div>
          <label class="sr-only" for="source">Diagram source</label>
          <textarea id="source" spellcheck="false" autocapitalize="off"></textarea>
        </section>
        <section class="preview-pane" data-pane-content="preview" aria-labelledby="preview-heading">
          <div class="pane-heading"><h2 id="preview-heading">Renderer preview</h2><div class="version-controls"><label for="version">Version</label><select id="version"><option value="11.17.2">Mermaid 11.17.2</option><option value="10.9.8">Mermaid 10.9.8</option></select><button data-action="compare">Compare versions</button></div></div>
          <div id="preview" class="preview-stage" aria-live="polite"><div class="loading-state"><span class="tube-dots" aria-hidden="true"><i></i><i></i><i></i></span>Starting the renderer…</div></div>
        </section>
      </section>
    </main>
    <input id="file-input" type="file" accept=".mmd,.mermaid,.d2,.svg,.png,text/plain,image/svg+xml,image/png" hidden />
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
  </div>`;
}

export function mountEditor(demo: boolean) {
  const source = document.querySelector<HTMLTextAreaElement>('#source')!;
  const engine = document.querySelector<HTMLSelectElement>('#engine')!;
  const version = document.querySelector<HTMLSelectElement>('#version')!;
  const preview = document.querySelector<HTMLElement>('#preview')!;
  const diagnostics = document.querySelector<HTMLElement>('#diagnostics')!;
  const byteCount = document.querySelector<HTMLElement>('#byte-count')!;
  const toast = document.querySelector<HTMLElement>('#toast')!;
  let lastSvg = '';
  let renderTicket = 0;
  let unlocked = localLicenseState().unlocked;

  const say = (message: string) => {
    toast.textContent = message; toast.classList.add('shown');
    setTimeout(() => toast.classList.remove('shown'), 2600);
  };

  const setLanguage = (language: Engine) => {
    engine.value = language;
    const isD2 = language === 'd2';
    version.disabled = isD2;
    version.innerHTML = isD2 ? '<option>D2 compact</option>' : '<option value="11.17.2">Mermaid 11.17.2</option><option value="10.9.8">Mermaid 10.9.8</option>';
    const reference = document.querySelector<HTMLElement>('#reference-copy')!;
    reference.innerHTML = isD2 ? '<code>name: Label</code><p>Use <code>a -&gt; b: label</code> for an arrow.</p><p>This build supports nodes, labels, and arrows.</p>' : '<code>flowchart LR</code><p>Use <code>A --&gt; B</code> for an arrow.</p><p>Use <code>A[Label]</code> for a named node.</p>';
  };

  const render = async () => {
    const ticket = ++renderTicket;
    const text = source.value;
    byteCount.textContent = `${new TextEncoder().encode(text).length} bytes`;
    preview.setAttribute('aria-busy', 'true');
    const selected = engine.value as Engine;
    const result = await renderDiagram(text, selected, selected === 'd2' ? 'D2 compact' : version.value as RendererVersion);
    if (ticket !== renderTicket) return;
    preview.removeAttribute('aria-busy');
    if (result.error) {
      lastSvg = '';
      preview.innerHTML = `<div class="error-state"><b>Preview stopped</b><p>${escapeHtml(result.error)}</p><button data-action="load-sample">Load working sample</button></div>`;
      diagnostics.className = 'status error'; diagnostics.textContent = result.error;
    } else {
      lastSvg = result.svg;
      preview.innerHTML = result.svg;
      diagnostics.className = result.warnings.length ? 'status warning' : 'status success';
      diagnostics.textContent = result.warnings.length ? result.warnings.join(' ') : 'Syntax parsed. Preview rendered.';
    }
    if (!demo) localStorage.setItem('real:diagram-source-studio:document', JSON.stringify({ source: text, engine: selected }));
  };

  let timer = 0;
  const scheduleRender = () => { clearTimeout(timer); timer = window.setTimeout(render, 220); };
  const loadSample = (language: Engine = engine.value as Engine) => {
    setLanguage(language); source.value = language === 'd2' ? D2_SAMPLE : MERMAID_SAMPLE; render();
  };

  async function exportSvg() {
    if (!lastSvg) return say('Fix the preview before exporting.');
    const content = embedSourceInSvg(lastSvg, source.value, engine.value as Engine);
    const saved = await nativeInvoke<boolean>('save_document', { name: 'diagram.svg', contents: content });
    if (!saved) download(content, 'image/svg+xml', 'diagram.svg');
    say('SVG exported with editable source.');
  }

  async function exportPng() {
    if (!lastSvg) return say('Fix the preview before exporting.');
    const image = new Image();
    const svgUrl = URL.createObjectURL(new Blob([lastSvg], { type: 'image/svg+xml' }));
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(image.naturalWidth, 1200); canvas.height = Math.max(image.naturalHeight, 675);
      const context = canvas.getContext('2d')!; context.fillStyle = '#10141a'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0);
      canvas.toBlob(async (blob) => {
        if (!blob) return say('PNG export failed. Export SVG instead.');
        const encoded = embedSourceInPng(new Uint8Array(await blob.arrayBuffer()), source.value, engine.value as Engine);
        const base64 = btoa(String.fromCharCode(...encoded));
        const saved = await nativeInvoke<boolean>('save_binary', { name: 'diagram.png', base64 });
        if (!saved) download(encoded, 'image/png', 'diagram.png');
        say('PNG exported with editable source.');
      }, 'image/png');
      URL.revokeObjectURL(svgUrl);
    };
    image.onerror = () => say('PNG export failed. Export SVG instead.');
    image.src = svgUrl;
  }

  async function compare() {
    if (engine.value === 'd2') return say('D2 compact has one bundled renderer.');
    if (!unlocked) {
      say('The renderer matrix is in the one-time Studio license.');
      document.querySelector('.license-panel')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    preview.innerHTML = '<div class="loading-state">Rendering both bundled versions…</div>';
    const [current, previous] = await Promise.all([renderDiagram(source.value, 'mermaid', '11.17.2'), renderDiagram(source.value, 'mermaid', '10.9.8')]);
    const panel = (label: string, result: Awaited<ReturnType<typeof renderDiagram>>) => `<article class="matrix-result"><h3>${label}</h3>${result.error ? `<p class="error-copy">${escapeHtml(result.error)}</p>` : result.svg}</article>`;
    preview.innerHTML = `<div class="matrix">${panel('Mermaid 11.17.2', current)}${panel('Mermaid 10.9.8', previous)}</div>`;
    diagnostics.className = current.error || previous.error ? 'status warning' : 'status success';
    diagnostics.textContent = current.error || previous.error ? 'At least one bundled renderer stopped. Compare its message.' : (current.svg === previous.svg ? 'Both renderer outputs match exactly.' : 'Renderer outputs differ. Inspect both previews.');
  }

  async function openFile(file?: File) {
    let name = file?.name ?? '';
    let contents: string | Uint8Array;
    if (!file) {
      const native = await nativeInvoke<{ name: string; contents: string; binary: boolean }>('open_document');
      if (!native) return document.querySelector<HTMLInputElement>('#file-input')!.click();
      name = native.name;
      contents = native.binary ? Uint8Array.from(atob(native.contents), (character) => character.charCodeAt(0)) : native.contents;
    } else contents = new Uint8Array(await file.arrayBuffer());
    let restored: { source: string; engine: Engine } | null = null;
    if (name.endsWith('.svg')) restored = sourceFromSvg(typeof contents === 'string' ? contents : new TextDecoder().decode(contents));
    else if (name.endsWith('.png') && contents instanceof Uint8Array) restored = sourceFromPng(contents);
    if (restored) { setLanguage(restored.engine); source.value = restored.source; say('Editable source restored from the export.'); }
    else { source.value = typeof contents === 'string' ? contents : new TextDecoder().decode(contents); setLanguage(name.endsWith('.d2') ? 'd2' : 'mermaid'); say('Source file opened.'); }
    render();
  }

  document.addEventListener('input', (event) => { if (event.target === source) scheduleRender(); });
  engine.addEventListener('change', () => { setLanguage(engine.value as Engine); render(); });
  version.addEventListener('change', render);
  document.querySelector<HTMLInputElement>('#file-input')!.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]; if (file) openFile(file);
  });
  document.addEventListener('click', async (event) => {
    const action = (event.target as HTMLElement).closest<HTMLElement>('[data-action]')?.dataset.action;
    if (action === 'load-sample' || action === 'reset-demo') loadSample('mermaid');
    if (action === 'open') openFile();
    if (action === 'save') {
      const extension = engine.value === 'd2' ? 'd2' : 'mmd';
      const saved = await nativeInvoke<boolean>('save_document', { name: `diagram.${extension}`, contents: source.value });
      if (!saved) download(source.value, 'text/plain', `diagram.${extension}`);
      say('Source saved.');
    }
    if (action === 'export-svg') exportSvg();
    if (action === 'export-png') exportPng();
    if (action === 'compare') compare();
    if (action === 'restore-license') {
      const token = document.querySelector<HTMLInputElement>('#license-token')!.value;
      if (!token.trim()) return say('Paste your license token first.');
      saveLicense(token); const state = await verifyLicense(); unlocked = state.unlocked; updateLicense(); say(state.unlocked ? 'Studio license verified.' : 'That license is not active.');
    }
  });

  document.querySelectorAll<HTMLButtonElement>('[data-pane]').forEach((tab, index, tabs) => {
    tab.addEventListener('click', () => showPane(tab.dataset.pane!));
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; next.focus(); showPane(next.dataset.pane!);
    });
  });
  function showPane(name: string) {
    document.querySelectorAll<HTMLElement>('[data-pane]').forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.pane === name)));
    document.querySelector('.workbench')?.setAttribute('data-mobile-pane', name);
  }

  const updateLicense = () => {
    const state = localLicenseState(); unlocked = state.unlocked;
    document.querySelector<HTMLElement>('#license-state')!.innerHTML = unlocked
      ? '<span class="license-ok">Studio license active</span><p>Two-version comparison is available.</p>'
      : `<p>${state.notice ?? 'The free editor includes preview and both exports.'}</p><a class="buy-link" href="${checkoutUrl}">Buy Studio for $39 once</a><p>Studio adds the two-version comparison.</p>`;
  };
  updateLicense(); verifyLicense().then(() => updateLicense());

  if (demo) loadSample('mermaid');
  else {
    try {
      const saved = JSON.parse(localStorage.getItem('real:diagram-source-studio:document') ?? 'null');
      if (saved?.source) { setLanguage(saved.engine); source.value = saved.source; render(); } else loadSample('mermaid');
    } catch { loadSample('mermaid'); }
  }
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] ?? character));
