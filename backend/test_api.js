const https = require('https');
require('dotenv').config();

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GROK_API_KEY;
    const data = body ? JSON.stringify(body) : '';

    const options = {
      hostname: 'api.x.ai',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    };

    if (data) {
      options.headers['Content-Length'] = data.length;
    }

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

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testAPI() {
  try {
    console.log('Testing models endpoint...');
    const result = await makeRequest('/v1/models');
    console.log('Models response:', result.statusCode, result.body);

    // Try a simple completion with different model names
    const modelsToTry = ['grok-2-1212', 'grok-beta', 'grok-1', 'grok'];

    for (const model of modelsToTry) {
      console.log(`\nTrying model: ${model}`);
      const completionResult = await makeRequest('/v1/chat/completions', 'POST', {
        model: model,
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 10,
      });

      if (completionResult.statusCode === 200) {
        console.log(`✅ Model ${model} works!`);
        console.log('Response:', completionResult.body);
        break;
      } else {
        console.log(`❌ Model ${model} failed:`, completionResult.body);
      }
    }

  } catch (err) {
    console.log('Error:', err.message);
  }
}

testAPI();