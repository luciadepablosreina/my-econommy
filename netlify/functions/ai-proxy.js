export async function onRequestPost(context) {
  try {
    const { imageBase64, mediaType, prompt } = await context.request.json();

    const OPENROUTER_KEY = context.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
    }

    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://my-econommy.luciadepablosreina.workers.dev',
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
      return new Response(JSON.stringify({ error: err }), { status: resp.status });
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || '';
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
