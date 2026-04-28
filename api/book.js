const SUPABASE_URL  = 'https://rlrufmpknxbvhgjtnqpp.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscnVmbXBrbnhidmhnanRucXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjU1NzEsImV4cCI6MjA5MjIwMTU3MX0.GXGHYQTYh7jUtSv6gHbTPmJuaZNu61wv77fZEXvxnSg';
const N8N_WEBHOOK   = 'https://firasabbas.app.n8n.cloud/webhook/book';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ─── GET /api/book?shop_id=xxx — fetch barbers ────────────────
  if (req.method === 'GET') {
    const { shop_id } = req.query;
    if (!shop_id) return res.status(400).json({ error: 'shop_id required' });

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/barbers?shop_id=eq.${shop_id}&active=eq.true&select=name,calendar_id`,
        {
          headers: {
            'apikey': SUPABASE_ANON,
            'Authorization': `Bearer ${SUPABASE_ANON}`
          }
        }
      );
      const barbers = await response.json();
      return res.status(200).json(barbers);
    } catch (err) {
      console.error('Supabase error:', err);
      return res.status(500).json({ error: 'Failed to fetch barbers' });
    }
  }

  // ─── POST /api/book — forward to N8N ─────────────────────────
  if (req.method === 'POST') {
    try {
      const response = await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      return res.status(response.status).json({ status: response.status });
    } catch (err) {
      console.error('N8N error:', err);
      return res.status(500).json({ error: 'Proxy failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
