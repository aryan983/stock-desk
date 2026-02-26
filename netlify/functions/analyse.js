exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  try {
    const { ticker, price } = JSON.parse(event.body);
    if (!ticker) return { statusCode: 400, body: JSON.stringify({ error: 'No ticker provided' }) };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: `You are a concise stock analyst giving a 3-month performance summary.
Search for recent news and price performance for the given stock.
Respond with EXACTLY 3 lines of plain text (no markdown, no bullets, no headers).
Line 1: What happened to the price over the last 3 months (up/down how much, key driver).
Line 2: The single most important recent news or catalyst.
Line 3: Outlook â one sentence on what to watch.
Keep each line under 120 characters. Be direct and specific.`,
        messages: [{
          role: 'user',
          content: `3-month analysis for ${ticker}.${price ? ` Current price: ${price}.` : ''}`
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Anthropic API error');

    const text = data.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim();

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
