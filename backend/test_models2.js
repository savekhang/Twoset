const https = require('https');
require('dotenv').config();

function makeRequest(model) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GROK_API_KEY;
    const data = JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: 'Hello!' }],
      max_tokens: 10,
    });

    const options = {
      hostname: 'api.x.ai',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

async function testModels() {
  const models = ['grok', 'grok-1', 'grok-beta', 'grok-2', 'grok-vision-beta', 'grok-2-1212'];

  for (const model of models) {
    try {
      console.log('Testing model:', model);
      const result = await makeRequest(model);

      if (result.statusCode === 200) {
        console.log('✅ Model', model, 'works!');
        console.log('Response:', result.body);
        break;
      } else {
        console.log('❌ Model', model, 'failed:', result.statusCode, result.body);
      }
    } catch (err) {
      console.log('❌ Model', model, 'error:', err.message);
    }
  }
}

testModels();