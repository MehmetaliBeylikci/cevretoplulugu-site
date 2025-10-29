// /api/fetch-rss.js (Node 18+)
export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Missing url param' });

    // Medium CORS sorununa server-side çözüm:
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      // basit cache
      next: { revalidate: 300 }
    });

    if (!r.ok) {
      return res.status(r.status).send(await r.text());
    }

    const text = await r.text();

    // XML döndürelim:
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).send(text);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
