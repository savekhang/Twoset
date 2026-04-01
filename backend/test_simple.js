// Simple test for Grok API
require('dotenv').config();

async function testGrokAPI() {
  const apiKey = process.env.GROK_API_KEY;
  console.log("API Key exists:", !!apiKey);
  console.log("API Key length:", apiKey ? apiKey.length : 0);

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: 'Hello, just testing!' }],
        max_tokens: 50,
      }),
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText);
    } else {
      const data = await response.json();
      console.log("Success response:", data);
    }
  } catch (err) {
    console.error("Network error:", err);
  }
}

testGrokAPI();