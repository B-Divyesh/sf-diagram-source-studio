import { pathToFileURL } from 'node:url';

const PRODUCT_SLUG = 'diagram-source-studio';
const EXPECTED_PRICE = 3900;
const EXPECTED_CURRENCY = 'USD';
const EXPECTED_PRODUCT_URL = 'https://diagram-source-studio.sociobot.in/';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export async function verifyLiveBilling(fetchImpl = fetch, apiBase = 'https://api.sociobot.in/api/v1') {
  const base = apiBase.replace(/\/$/, '');
  const catalogResponse = await fetchImpl(`${base}/products`, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(15_000)
  });
  assert(catalogResponse.ok, `billing catalog returned HTTP ${catalogResponse.status}`);

  const catalog = await catalogResponse.json();
  const product = catalog?.data?.find((entry) => entry?.slug === PRODUCT_SLUG);
  assert(product, `billing catalog is missing ${PRODUCT_SLUG}`);
  assert(product.price_minor === EXPECTED_PRICE, `billing catalog price is ${product.price_minor}, expected ${EXPECTED_PRICE}`);
  assert(product.currency === EXPECTED_CURRENCY, `billing catalog currency is ${product.currency}, expected ${EXPECTED_CURRENCY}`);
  assert(product.product_url === EXPECTED_PRODUCT_URL, `billing return URL is ${product.product_url}, expected ${EXPECTED_PRODUCT_URL}`);
  assert(product.checkout_url === `${base}/products/${PRODUCT_SLUG}/checkout`, 'billing catalog checkout URL is incorrect');

  const checkoutResponse = await fetchImpl(product.checkout_url, {
    redirect: 'manual',
    signal: AbortSignal.timeout(15_000)
  });
  assert([302, 303, 307, 308].includes(checkoutResponse.status), `checkout returned HTTP ${checkoutResponse.status}, expected a redirect`);
  const location = checkoutResponse.headers.get('location');
  assert(location, 'checkout response has no redirect location');
  const checkout = new URL(location);
  assert(checkout.protocol === 'https:', 'checkout redirect is not HTTPS');
  assert(checkout.hostname === 'checkout.dodopayments.com', `checkout redirect host is ${checkout.hostname}`);
  assert(checkout.pathname.startsWith('/session/'), 'checkout redirect is not a hosted checkout session');

  return {
    slug: product.slug,
    price_minor: product.price_minor,
    currency: product.currency,
    product_url: product.product_url,
    checkout_status: checkoutResponse.status,
    checkout_host: checkout.hostname
  };
}

async function main() {
  const result = await verifyLiveBilling(fetch, process.env.SOCIOBOT_API_BASE);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`Live billing verification failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
