// api/availability.js
// Vercel serverless function — proxies Google Calendar freebusy requests
// The API key lives in process.env.GCAL_API_KEY (Vercel Environment Variables)
// This file is safe to commit to GitHub — it never contains the key value

export default async function handler(req, res) {
  // Allow requests from your own domain only
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { calendarId, date } = req.body;

  if (!calendarId || !date) {
    return res.status(400).json({ error: 'calendarId and date are required' });
  }

  const apiKey = process.env.GCAL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Calendar API not configured' });
  }

  const timeMin = `${date}T00:00:00Z`;
  const timeMax = `${date}T23:59:59Z`;

  try {
    const googleRes = await fetch(
      `https://www.googleapis.com/calendar/v3/freeBusy?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // API key is referrer-restricted; server-side calls need to identify as the site
          'Referer': 'https://barberiq-booking.vercel.app/'
        },
        body: JSON.stringify({
          timeMin,
          timeMax,
          items: [{ id: calendarId }]
        })
      }
    );

    if (!googleRes.ok) {
      const err = await googleRes.json();
      return res.status(googleRes.status).json({ error: err });
    }

    const data = await googleRes.json();
    const busy = data.calendars?.[calendarId]?.busy || [];

    return res.status(200).json({ busy });

  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch availability' });
  }
}
