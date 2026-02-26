exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  try {
    const { ticker, price } = JSON.parse(event.body);
    if (!ticker) return { statusCode: 400, body: JSON.stringify({ error: 'No ticker provided' }) };

    const prompt = `You are a concise stock analyst. Give a 3-month performance summary for ${ticker}.${price ? ` Current price: ${price}.` : ''}

Respond with EXACTLY 3 lines of plain text (no markdown, no bullets, no headers, no asterisks).
Line 1: What happened to the price over the last 3 months (up/down how much, key driver).
Line 2: The single most important recent news or catalyst.
Line 3: Outlook — one sentence on what to watch.
Keep each line under 120 characters. Be direct and specific.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 300
          }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Gemini API error');

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error('No response from Gemini');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
