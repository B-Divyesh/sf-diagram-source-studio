const LICENSE_KEY = 'sb_license:diagram-source-studio';
const VERDICT_KEY = 'sb_license_verdict:diagram-source-studio';
const BASE = 'https://api.sociobot.in/api/v1/products/diagram-source-studio';

export interface LicenseState { unlocked: boolean; notice?: string }

export function captureLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(LICENSE_KEY, token);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function saveLicense(token: string): void {
  localStorage.setItem(LICENSE_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function localLicenseState(): LicenseState {
  const token = localStorage.getItem(LICENSE_KEY);
  if (!token) return { unlocked: false };
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '{}');
    if (cached.valid) return { unlocked: true };
    if (cached.checkedAt && Date.now() - cached.checkedAt < 86_400_000) return { unlocked: false, notice: 'This license is no longer active.' };
  } catch { /* verify below */ }
  return { unlocked: true };
}

export async function verifyLicense(): Promise<LicenseState> {
  const token = localStorage.getItem(LICENSE_KEY);
  if (!token) return { unlocked: false };
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '{}');
    if (cached.checkedAt && Date.now() - cached.checkedAt < 86_400_000) return { unlocked: Boolean(cached.valid), notice: cached.valid ? undefined : 'This license is no longer active.' };
    const response = await fetch(`${BASE}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('verify unavailable');
    const data = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: data.valid, checkedAt: Date.now() }));
    return { unlocked: data.valid, notice: data.valid ? undefined : 'This license is no longer active.' };
  } catch {
    return localLicenseState();
  }
}

export const checkoutUrl = `${BASE}/checkout`;
