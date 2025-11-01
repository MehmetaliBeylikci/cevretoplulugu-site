// /api/fetch-rss.js
export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Missing url param' });
    }

    // Medium CORS sorununa server-side çözüm
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSSFetch/1.0; +https://vercel.app)',
        'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
      },
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      return res.status(upstream.status).send(errorText);
    }

    const xmlText = await upstream.text();

    // XML olarak döndürelim
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).send(xmlText);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
