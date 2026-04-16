const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');
const { SSMClient, GetParameterCommand, PutParameterCommand } = require('@aws-sdk/client-ssm');
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const OAUTH_PROVIDER = 'github';
const BUCKET = process.env.S3_BUCKET || 'oromo-church-utrecht-website';
const JWT_SECRET_PARAM = process.env.JWT_SECRET_PARAM || '/oromo-church-utrecht/jwt-secret';
const ADMIN_USERS_PARAM = process.env.ADMIN_USERS_PARAM || '/oromo-church-utrecht/admin-users';
const LANGS = ['en', 'nl', 'om'];

const ssm = new SSMClient();
const s3 = new S3Client();

// ── Caches ──
let cachedGithubSecret = null;
let cachedJwtSecret = null;
let cachedAdminUsers = null;

async function getParam(name, withDecryption = true) {
  const resp = await ssm.send(new GetParameterCommand({ Name: name, WithDecryption: withDecryption }));
  return resp.Parameter.Value;
}

async function getGithubSecret() {
  if (!cachedGithubSecret) cachedGithubSecret = await getParam(process.env.GITHUB_CLIENT_SECRET_PARAM);
  return cachedGithubSecret;
}

async function getJwtSecret() {
  if (!cachedJwtSecret) cachedJwtSecret = await getParam(JWT_SECRET_PARAM);
  return cachedJwtSecret;
}

async function getAdminUsers() {
  if (!cachedAdminUsers) {
    const raw = await getParam(ADMIN_USERS_PARAM);
    cachedAdminUsers = JSON.parse(raw);
  }
  return cachedAdminUsers;
}

async function saveAdminUsers(users) {
  await ssm.send(new PutParameterCommand({
    Name: ADMIN_USERS_PARAM,
    Value: JSON.stringify(users),
    Type: 'SecureString',
    Overwrite: true,
  }));
  cachedAdminUsers = users;
}

// ── Helpers ──
function hashPassword(password, salt) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, storedHash, storedSalt) {
  const { hash } = hashPassword(password, storedSalt);
  return hash === storedHash;
}

function createToken(payload, secret, expiresInHours = 24) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(JSON.stringify({ ...payload, iat: now, exp: now + expiresInHours * 3600 })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const sig = crypto.createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest('base64url');
  if (sig !== parts[2]) return null;
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

async function authenticate(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return null;
  const secret = await getJwtSecret();
  return verifyToken(token, secret);
}

function cors(response) {
  response.headers = {
    ...response.headers,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };
  return response;
}

function json(statusCode, data) {
  return cors({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}

function parseBody(event) {
  if (!event.body) return {};
  const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body;
  return JSON.parse(body);
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

// ── Handler ──
exports.handler = async (event) => {
  const path = event.rawPath || event.requestContext?.http?.path || '';
  const method = event.requestContext?.http?.method || event.httpMethod || '';

  // CORS preflight
  if (method === 'OPTIONS') {
    return cors({ statusCode: 204, body: '' });
  }

  // Health check
  if (path === '/api/health') {
    return json(200, { status: 'ok' });
  }

  // ── GitHub OAuth (Decap CMS) ──
  if (path === '/api/auth' && method === 'GET') {
    const params = querystring.stringify({ client_id: CLIENT_ID, scope: 'repo,user' });
    return { statusCode: 302, headers: { Location: `https://github.com/login/oauth/authorize?${params}` } };
  }

  if ((path === '/api/callback' || path === '/callback') && method === 'GET') {
    const code = event.queryStringParameters?.code || new URLSearchParams(event.rawQueryString).get('code');
    if (!code) return json(400, { error: 'Missing code parameter' });
    try {
      const clientSecret = await getGithubSecret();
      const tokenData = await httpPost('https://github.com/login/oauth/access_token', {
        client_id: CLIENT_ID, client_secret: clientSecret, code,
      });
      const content = JSON.stringify({ token: tokenData.access_token, provider: OAUTH_PROVIDER });
      const body = `<!DOCTYPE html><html><body><script>
(function(){var c=${content};function r(e){window.opener.postMessage("authorization:github:success:"+JSON.stringify(c),e.origin);window.removeEventListener("message",r,false)}window.addEventListener("message",r,false);window.opener.postMessage("authorizing:github","*")})();
</script></body></html>`;
      return { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body };
    } catch (err) {
      return json(500, { error: 'OAuth exchange failed', details: err.message });
    }
  }

  // ── Admin Login ──
  if (path === '/api/admin/login' && method === 'POST') {
    try {
      const { username, password } = parseBody(event);
      if (!username || !password) return json(400, { error: 'Username and password required' });
      const users = await getAdminUsers();
      const user = users.find((u) => u.username === username);
      if (!user || !verifyPassword(password, user.hash, user.salt)) {
        return json(401, { error: 'Invalid credentials' });
      }
      const secret = await getJwtSecret();
      const token = createToken({ username: user.username, role: user.role || 'admin' }, secret);
      return json(200, { token, username: user.username, role: user.role || 'admin' });
    } catch (err) {
      return json(500, { error: 'Login failed', details: err.message });
    }
  }

  // ── Admin: Verify Token ──
  if (path === '/api/admin/verify' && method === 'GET') {
    const user = await authenticate(event);
    if (!user) return json(401, { error: 'Unauthorized' });
    return json(200, { username: user.username, role: user.role });
  }

  // ── Admin: Get Content ──
  if (path === '/api/admin/content' && method === 'GET') {
    const user = await authenticate(event);
    if (!user) return json(401, { error: 'Unauthorized' });
    try {
      const content = {};
      for (const lang of LANGS) {
        const resp = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: `content/${lang}.json` }));
        content[lang] = JSON.parse(await resp.Body.transformToString());
      }
      return json(200, content);
    } catch (err) {
      return json(500, { error: 'Failed to load content', details: err.message });
    }
  }

  // ── Admin: Save Content ──
  if (path === '/api/admin/content' && method === 'PUT') {
    const user = await authenticate(event);
    if (!user) return json(401, { error: 'Unauthorized' });
    try {
      const content = parseBody(event);
      for (const lang of LANGS) {
        if (content[lang]) {
          await s3.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: `content/${lang}.json`,
            Body: JSON.stringify(content[lang], null, 2),
            ContentType: 'application/json',
            CacheControl: 'no-cache, no-store, must-revalidate',
          }));
        }
      }
      return json(200, { success: true, message: 'Content saved' });
    } catch (err) {
      return json(500, { error: 'Failed to save content', details: err.message });
    }
  }

  // ── Admin: List Users (owner only) ──
  if (path === '/api/admin/users' && method === 'GET') {
    const user = await authenticate(event);
    if (!user || user.role !== 'owner') return json(403, { error: 'Forbidden' });
    const users = await getAdminUsers();
    return json(200, users.map((u) => ({ username: u.username, role: u.role || 'admin' })));
  }

  // ── Admin: Add User (owner only) ──
  if (path === '/api/admin/users' && method === 'POST') {
    const user = await authenticate(event);
    if (!user || user.role !== 'owner') return json(403, { error: 'Forbidden' });
    const { username, password, role } = parseBody(event);
    if (!username || !password) return json(400, { error: 'Username and password required' });
    const users = await getAdminUsers();
    if (users.find((u) => u.username === username)) return json(409, { error: 'User already exists' });
    const { hash, salt } = hashPassword(password);
    users.push({ username, hash, salt, role: role || 'admin' });
    await saveAdminUsers(users);
    return json(201, { success: true, username });
  }

  // ── Admin: Delete User (owner only) ──
  if (path.startsWith('/api/admin/users/') && method === 'DELETE') {
    const user = await authenticate(event);
    if (!user || user.role !== 'owner') return json(403, { error: 'Forbidden' });
    const targetUser = decodeURIComponent(path.split('/api/admin/users/')[1]);
    let users = await getAdminUsers();
    const target = users.find((u) => u.username === targetUser);
    if (!target) return json(404, { error: 'User not found' });
    if (target.role === 'owner') return json(403, { error: 'Cannot delete owner' });
    users = users.filter((u) => u.username !== targetUser);
    await saveAdminUsers(users);
    return json(200, { success: true });
  }

  return json(404, { error: 'Not found' });
};
