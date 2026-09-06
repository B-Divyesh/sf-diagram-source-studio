const url = 'https://api.sociobot.in/api/v1/products/diagram-source-studio/verify?license=verification-11-invalid';
const responses = await Promise.all(Array.from({ length: 40 }, async () => {
  const response = await fetch(url);
  return { status: response.status, retryAfter: response.headers.get('retry-after') };
}));
const counts = Object.fromEntries([...new Set(responses.map(item => item.status))].map(status => [status, responses.filter(item => item.status === status).length]));
const report = { counts, rateLimited: responses.filter(item => item.status === 429) };
console.log(JSON.stringify(report, null, 2));
