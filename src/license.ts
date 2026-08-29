const LICENSE_KEY = 'sb_license:diagram-source-studio';
const VERDICT_KEY = 'sb_license_verdict:diagram-source-studio';
const BASE = 'https://api.sociobot.in/api/v1/products/diagram-source-studio';
const API_BASE = 'https://api.sociobot.in/api/v1';

interface CachedVerdict { valid?: boolean; checkedAt?: number; token?: string }
interface LicenseStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const demoValues = new Map<string, string>();
const demoStore: LicenseStore = {
  getItem: (key) => demoValues.get(key) ?? null,
  setItem: (key, value) => { demoValues.set(key, value); },
  removeItem: (key) => { demoValues.delete(key); }
};

const storeFor = (demo: boolean): LicenseStore => demo ? demoStore : localStorage;

export interface LicenseState { unlocked: boolean; notice?: string }
export interface BillingProduct { slug?: string; price_minor?: number; currency?: string }

// Sociobot's hosted Dodo checkout returns buyers here with ?license=<token>.
// captureLicense stores that token before the editor mounts; verifyLicense then
// reconciles it with the product-specific entitlement endpoint.
export const purchaseDeliveryReady = true;
export const purchaseDeliveryNotice = 'Studio checkout is unavailable right now. Try again shortly; the free editor still works.';

export function studioProductEnabled(products: BillingProduct[] | undefined): boolean {
  return Boolean(products?.some((product) => product.slug === 'diagram-source-studio' && product.price_minor === 3900 && product.currency === 'USD'));
}

function testBillingApiBase(): string | undefined {
  return (window as Window & { __DSS_TEST_BILLING_API_BASE__?: string }).__DSS_TEST_BILLING_API_BASE__;
}

export function canCheckBillingCatalog(): boolean {
  return !['localhost', '127.0.0.1'].includes(location.hostname) || Boolean(testBillingApiBase());
}

export function billingCatalogUrl(): string {
  return `${testBillingApiBase() ?? API_BASE}/products`;
}

export function captureLicense(demo = false): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  storeFor(demo).setItem(LICENSE_KEY, token);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function saveLicense(token: string, demo = false): void {
  const store = storeFor(demo);
  store.setItem(LICENSE_KEY, token.trim());
  store.removeItem(VERDICT_KEY);
}

function cachedVerdict(store: LicenseStore): CachedVerdict {
  try { return JSON.parse(store.getItem(VERDICT_KEY) ?? '{}') as CachedVerdict; }
  catch { return {}; }
}

export function localLicenseState(demo = false): LicenseState {
  const store = storeFor(demo);
  const token = store.getItem(LICENSE_KEY);
  if (!token) return { unlocked: false };
  const cached = cachedVerdict(store);
  if (cached.token === token && cached.valid === true) return { unlocked: true };
  if (cached.token === token && cached.valid === false) return { unlocked: false, notice: 'This license is no longer active.' };
  return { unlocked: false, notice: 'Connect once to verify this license.' };
}

export async function verifyLicense(demo = false): Promise<LicenseState> {
  const store = storeFor(demo);
  const token = store.getItem(LICENSE_KEY);
  if (!token) return { unlocked: false };
  try {
    const cached = cachedVerdict(store);
    if (cached.token === token && cached.checkedAt && Date.now() - cached.checkedAt < 86_400_000) {
      return { unlocked: cached.valid === true, notice: cached.valid ? undefined : 'This license is no longer active.' };
    }
    const response = await fetch(`${BASE}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('verify unavailable');
    const data = await response.json() as { valid: boolean };
    store.setItem(VERDICT_KEY, JSON.stringify({ valid: data.valid, checkedAt: Date.now(), token }));
    return { unlocked: data.valid, notice: data.valid ? undefined : 'This license is no longer active.' };
  } catch {
    return localLicenseState(demo);
  }
}

export const checkoutUrl = `${BASE}/checkout`;
