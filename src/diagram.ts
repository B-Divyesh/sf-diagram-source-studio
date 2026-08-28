export type Engine = 'mermaid' | 'd2';
export type RendererVersion = '11.17.2' | '10.9.8' | 'D2 compact';

export interface RenderResult {
  svg: string;
  error?: string;
  warnings: string[];
}

interface MermaidRenderer {
  initialize(config: Record<string, unknown>): void;
  render(id: string, source: string): Promise<{ svg: string }>;
}

const rendererCache = new Map<string, MermaidRenderer>();
let rendererLoad = Promise.resolve();

function loadMermaid(version: '10.9.8' | '11.17.2'): Promise<MermaidRenderer> {
  const cached = rendererCache.get(version);
  if (cached) return Promise.resolve(cached);
  let resolveRenderer!: (renderer: MermaidRenderer) => void;
  let rejectRenderer!: (error: Error) => void;
  const result = new Promise<MermaidRenderer>((resolve, reject) => { resolveRenderer = resolve; rejectRenderer = reject; });
  rendererLoad = rendererLoad.then(() => new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = `/vendor/mermaid-${version === '10.9.8' ? '10' : '11'}.min.js`;
    script.onload = () => {
      const renderer = (window as Window & { mermaid?: MermaidRenderer }).mermaid;
      if (!renderer) rejectRenderer(new Error('Bundled renderer did not load.'));
      else { rendererCache.set(version, renderer); resolveRenderer(renderer); }
      script.remove(); resolve();
    };
    script.onerror = () => { rejectRenderer(new Error('Bundled renderer could not be opened.')); resolve(); };
    document.head.append(script);
  }));
  return result;
}

const escapeXml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[character] ?? character));

export function bytesToBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function base64ToText(value: string): string {
  const binary = atob(value);
  return new TextDecoder('utf-8', { ignoreBOM: true }).decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}

export function sanitizeSvg(svg: string): string {
  const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const removeExternalUrls = (value: string) => value.replace(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/gi, (match, _quote, target: string) => target.startsWith('#') ? match : 'none');
  document.querySelectorAll('script, foreignObject, iframe, object, embed, a').forEach((node) => node.remove());
  document.querySelectorAll('style').forEach((node) => {
    const safeCss = (node.textContent ?? '')
      .replace(/@import[^;]+;?/gi, '')
      .replace(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/gi, (match, _quote, target: string) => target.startsWith('#') ? match : 'none');
    node.textContent = safeCss;
  });
  document.querySelectorAll('*').forEach((node) => {
    for (const attribute of [...node.attributes]) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      const cleanedValue = removeExternalUrls(attribute.value);
      if (name.startsWith('on') || name === 'href' || name.endsWith(':href') || name === 'src' || value.startsWith('javascript:')) {
        node.removeAttribute(attribute.name);
      } else if (cleanedValue !== attribute.value) node.setAttribute(attribute.name, cleanedValue);
    }
  });
  const root = document.documentElement;
  root.setAttribute('role', 'img');
  root.setAttribute('aria-label', 'Rendered diagram preview');
  return new XMLSerializer().serializeToString(root);
}

function renderD2(source: string): RenderResult {
  const labels = new Map<string, string>();
  const edges: Array<{ from: string; to: string; label: string }> = [];
  const warnings: string[] = [];
  const lines = source.split(/\r?\n/);

  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('direction:')) return;
    const edge = line.match(/^([\w.-]+)\s*->\s*([\w.-]+)(?:\s*:\s*(.+))?$/);
    if (edge) {
      const [, from, to, label = ''] = edge;
      labels.set(from, labels.get(from) ?? from);
      labels.set(to, labels.get(to) ?? to);
      edges.push({ from, to, label });
      return;
    }
    const node = line.match(/^([\w.-]+)\s*:\s*(.+)$/);
    if (node) {
      labels.set(node[1], node[2].replace(/^['"]|['"]$/g, ''));
      return;
    }
    warnings.push(`Line ${index + 1} is not part of the compact D2 syntax.`);
  });

  if (!labels.size) return { svg: '', error: 'No D2 nodes found. Add a node or an arrow.', warnings };
  const ids = [...labels.keys()];
  const width = Math.max(640, ids.length * 190);
  const positions = new Map(ids.map((id, index) => [id, { x: 40 + index * 180, y: 90 + (index % 2) * 130 }]));
  const edgeSvg = edges.map(({ from, to, label }) => {
    const start = positions.get(from)!;
    const end = positions.get(to)!;
    const x1 = start.x + 130;
    const y1 = start.y + 32;
    const x2 = end.x;
    const y2 = end.y + 32;
    return `<path d="M${x1} ${y1} C${x1 + 45} ${y1},${x2 - 45} ${y2},${x2} ${y2}" fill="none" stroke="#36f1e4" stroke-width="3" marker-end="url(#arrow)"/><text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 9}" fill="#f5f1e8" font-size="13" text-anchor="middle">${escapeXml(label)}</text>`;
  }).join('');
  const nodeSvg = ids.map((id) => {
    const point = positions.get(id)!;
    return `<g><rect x="${point.x}" y="${point.y}" width="130" height="64" rx="3" fill="#19202a" stroke="#36f1e4" stroke-width="2"/><text x="${point.x + 65}" y="${point.y + 38}" fill="#f5f1e8" font-size="15" text-anchor="middle">${escapeXml(labels.get(id)!)}</text></g>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 360"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#36f1e4"/></marker></defs><rect width="100%" height="100%" fill="#10141a"/>${edgeSvg}${nodeSvg}</svg>`;
  return { svg: sanitizeSvg(svg), warnings };
}

export async function renderDiagram(source: string, engine: Engine, version?: RendererVersion): Promise<RenderResult> {
  if (!source.trim()) return { svg: '', error: 'The source is empty. Type a diagram or load the sample.', warnings: [] };
  if (engine === 'd2') return renderD2(source);
  try {
    const mermaid = await loadMermaid(version === '10.9.8' ? '10.9.8' : '11.17.2');
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      htmlLabels: false,
      flowchart: { htmlLabels: false },
      fontFamily: 'Atkinson Hyperlegible, sans-serif',
      themeVariables: {
        background: '#10141a', primaryColor: '#19202a', primaryTextColor: '#f5f1e8',
        primaryBorderColor: '#36f1e4', lineColor: '#36f1e4', secondaryColor: '#241421',
        tertiaryColor: '#19131c', noteBkgColor: '#332917', noteTextColor: '#f5f1e8'
      }
    });
    const id = `diagram-${version?.replaceAll('.', '-') ?? 'current'}-${crypto.randomUUID().slice(0, 8)}`;
    const output = await mermaid.render(id, source);
    return { svg: sanitizeSvg(output.svg), warnings: [] };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return { svg: '', error: `The ${version ?? 'current'} renderer stopped: ${message.split('\n')[0]}. Check the marked source.`, warnings: [] };
  }
}

export function embedSourceInSvg(svg: string, source: string, engine: Engine): string {
  const payload = bytesToBase64(JSON.stringify({ source: bytesToBase64(source), engine, encoding: 'utf-8' }));
  return svg.replace(/<svg([^>]*)>/, `<svg$1><metadata id="diagram-source-studio" data-encoding="base64">${payload}</metadata>`);
}

export function sourceFromSvg(svg: string): { source: string; engine: Engine } | null {
  const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const metadata = document.querySelector('metadata#diagram-source-studio');
  if (!metadata?.textContent) return null;
  try {
    const payload = JSON.parse(base64ToText(metadata.textContent));
    return { source: base64ToText(payload.source), engine: payload.engine === 'd2' ? 'd2' : 'mermaid' };
  } catch {
    return null;
  }
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let index = 0; index < 8; index++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const uint32 = (value: number) => new Uint8Array([(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255]);

export function embedSourceInPng(png: Uint8Array, source: string, engine: Engine): Uint8Array {
  const keyword = new TextEncoder().encode('DiagramSourceStudio\0');
  const payload = new TextEncoder().encode(bytesToBase64(JSON.stringify({ source: bytesToBase64(source), engine, encoding: 'utf-8' })));
  const data = new Uint8Array(keyword.length + payload.length);
  data.set(keyword); data.set(payload, keyword.length);
  const type = new TextEncoder().encode('tEXt');
  const crcData = new Uint8Array(type.length + data.length);
  crcData.set(type); crcData.set(data, type.length);
  const chunk = new Uint8Array(12 + data.length);
  chunk.set(uint32(data.length)); chunk.set(type, 4); chunk.set(data, 8); chunk.set(uint32(crc32(crcData)), 8 + data.length);
  const insertAt = 33;
  const output = new Uint8Array(png.length + chunk.length);
  output.set(png.slice(0, insertAt)); output.set(chunk, insertAt); output.set(png.slice(insertAt), insertAt + chunk.length);
  return output;
}

export function sourceFromPng(png: Uint8Array): { source: string; engine: Engine } | null {
  const marker = new TextEncoder().encode('DiagramSourceStudio\0');
  let offset = 8;
  while (offset + 12 <= png.length) {
    const view = new DataView(png.buffer, png.byteOffset + offset, 4);
    const length = view.getUint32(0);
    const type = new TextDecoder().decode(png.slice(offset + 4, offset + 8));
    const data = png.slice(offset + 8, offset + 8 + length);
    if (type !== 'tEXt') { offset += 12 + length; continue; }
    const matches = marker.every((byte, index) => data[index] === byte);
    if (!matches) { offset += 12 + length; continue; }
    try {
      const encoded = new TextDecoder().decode(data.slice(marker.length));
      const payload = JSON.parse(base64ToText(encoded));
      return { source: base64ToText(payload.source), engine: payload.engine === 'd2' ? 'd2' : 'mermaid' };
    } catch { return null; }
  }
  return null;
}
