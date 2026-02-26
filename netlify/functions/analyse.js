exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const GROQ_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  try {
    const { ticker, price } = JSON.parse(event.body);
    if (!ticker) return { statusCode: 400, body: JSON.stringify({ error: 'No ticker provided' }) };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content: `You are a concise stock analyst giving a 3-month performance summary.
Respond with EXACTLY 3 lines of plain text (no markdown, no bullets, no headers, no asterisks).
Line 1: What happened to the price over the last 3 months (up/down how much, key driver).
Line 2: The single most important recent news or catalyst.
Line 3: Outlook — one sentence on what to watch.
Keep each line under 120 characters. Be direct and specific.`
          },
          {
            role: 'user',
            content: `3-month analysis for ${ticker}.${price ? ` Current price: ${price}.` : ''}`
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Groq API error');

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('No response from Groq');

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
