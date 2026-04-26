export default async function handler(req, res) {
  // Allow requests from your Vercel domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://firasabbas.app.n8n.cloud/webhook/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const status = response.status;
    return res.status(status).json({ status });

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Proxy failed' });
  }
}
