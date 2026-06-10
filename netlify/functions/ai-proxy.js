exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { imageBase64, mediaType, prompt } = JSON.parse(event.body);

    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
    }

    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://my-econommy.netlify.app',
        'X-Title': 'My Econommy',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mediaType};base64,${imageBase64}` } },
            { type: 'text', text: prompt }
          ]
        }]
      })
    });

    if (!resp.ok) {
      const err = await resp.text();
      return { statusCode: resp.status, body: JSON.stringify({ error: err }) };
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || '';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
