export async function handler(event) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  }

  const url = event.queryStringParameters.url;
  if (!url) {
    return { statusCode: 400, body: 'Missing ?url=' };
  }

  try {
    const resp = await fetch(url, {
      // bazı CDN’ler user-agent istiyor
      headers: { 'User-Agent': 'Mozilla/5.0 (Netlify Functions RSS Proxy)' },
    });
    const text = await resp.text();
    return {
      statusCode: resp.ok ? 200 : resp.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300', // 5 dk cache
      },
      body: text,
    };
  } catch (e) {
    return { statusCode: 502, body: 'Upstream fetch failed: ' + e.message };
  }
}
