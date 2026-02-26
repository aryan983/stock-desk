exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const PERPLEXITY_KEY = process.env.PERPLEXITY_API_KEY;
  if (!PERPLEXITY_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  try {
    const { ticker, price } = JSON.parse(event.body);
    if (!ticker) return { statusCode: 400, body: JSON.stringify({ error: 'No ticker provided' }) };

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_KEY}`
      },
      body: JSON.stringify({
        model: 'sonar',
        max_tokens: 300,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `You are a concise stock analyst. Use your web search to find real, current information.
Respond with EXACTLY 3 lines of plain text (no markdown, no bullets, no headers, no asterisks, no citations).
Line 1: What actually happened to the price over the last 3 months (specific % and real key driver).
Line 2: The single most important recent news or catalyst with a real specific detail.
Line 3: Outlook — one specific sentence on what to watch next.
Keep each line under 120 characters. Be direct, specific, and only state verified facts.`
          },
          {
            role: 'user',
            content: `Search for and give me a real 3-month analysis for ${ticker} stock.${price ? ` Current price: ${price}.` : ''}`
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Perplexity API error');

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('No response from Perplexity');

    // Strip any citation brackets like [1] [2] that Perplexity sometimes adds
    const clean = text.replace(/\[\d+\]/g, '').trim();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
