const https = require('https');
const querystring = require('querystring');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const OAUTH_PROVIDER = 'github';

let cachedSecret = null;
async function getClientSecret() {
  if (cachedSecret) return cachedSecret;
  const ssm = new SSMClient();
  const resp = await ssm.send(new GetParameterCommand({
    Name: process.env.GITHUB_CLIENT_SECRET_PARAM,
    WithDecryption: true,
  }));
  cachedSecret = resp.Parameter.Value;
  return cachedSecret;
}

function httpPost(url, data) {
  return new Promise((resolve, reject) => {
    const body = querystring.stringify(data);
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        Accept: 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => (responseBody += chunk));
      res.on('end', () => resolve(JSON.parse(responseBody)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  const path = event.rawPath || event.requestContext?.http?.path || '';
  const method = event.requestContext?.http?.method || event.httpMethod || '';

  // Health check
  if (path === '/api/health') {
    return { statusCode: 200, body: JSON.stringify({ status: 'ok' }) };
  }

  // Step 1: Redirect user to GitHub for authorization
  if (path === '/api/auth' && method === 'GET') {
    const params = querystring.stringify({
      client_id: CLIENT_ID,
      scope: 'repo,user',
    });
    return {
      statusCode: 302,
      headers: { Location: `https://github.com/login/oauth/authorize?${params}` },
    };
  }

  // Step 2: Handle callback from GitHub — exchange code for token
  if ((path === '/api/callback' || path === '/callback') && method === 'GET') {
    const code =
      event.queryStringParameters?.code ||
      new URLSearchParams(event.rawQueryString).get('code');

    if (!code) {
      return { statusCode: 400, body: 'Missing code parameter' };
    }

    try {
      const clientSecret = await getClientSecret();
      const tokenData = await httpPost('https://github.com/login/oauth/access_token', {
        client_id: CLIENT_ID,
        client_secret: clientSecret,
        code,
      });

      const content = JSON.stringify({
        token: tokenData.access_token,
        provider: OAUTH_PROVIDER,
      });

      // Return an HTML page that sends the token back to the CMS via postMessage
      const body = `<!DOCTYPE html>
<html>
<body>
<script>
(function() {
  var content = ${content};
  function receiveMessage(e) {
    console.log("receiveMessage", e);
    window.opener.postMessage(
      "authorization:github:success:" + JSON.stringify(content),
      e.origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
</body>
</html>`;

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body,
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OAuth exchange failed', details: err.message }),
      };
    }
  }

  return { statusCode: 404, body: 'Not found' };
};
