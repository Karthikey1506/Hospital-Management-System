const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

// Helper to make test HTTP requests to running server
function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const fullPath = path.startsWith('/api-docs') ? path : `/api${path}`;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: fullPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

test('REST API Test Suite: Auth, Patients, Audit Logs, OpenAPI Docs', async (t) => {
  let authToken = null;

  await t.test('1. POST /api/auth/login - Admin Login', async () => {
    const res = await makeRequest('/auth/login', 'POST', {
      email: 'admin@hospital.com',
      password: 'admin123'
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Login successful');
    assert.ok(res.body.token);
    authToken = res.body.token;
  });

  await t.test('2. POST /api/auth/login - Invalid Credentials Failure', async () => {
    const res = await makeRequest('/auth/login', 'POST', {
      email: 'admin@hospital.com',
      password: 'wrongpassword'
    });
    assert.equal(res.status, 401);
  });

  await t.test('3. GET /api/patients - Authenticated List Patients', async () => {
    const res = await makeRequest('/patients', 'GET', null, authToken);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length > 0);
  });

  await t.test('4. POST /api/patients - Register New Patient Validation', async () => {
    const res = await makeRequest('/patients', 'POST', {
      name: 'Test Patient',
      age: 30,
      gender: 'Male',
      phone: '9876543210',
      triageLevel: 'GREEN'
    }, authToken);

    assert.equal(res.status, 201);
    assert.equal(res.body.name, 'Test Patient');
  });

  await t.test('5. GET /api/audit-logs - Admin Audit Logs Retrieval', async () => {
    const res = await makeRequest('/audit-logs', 'GET', null, authToken);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });

  await t.test('6. GET /api-docs - OpenAPI 3.0 Documentation Specification', async () => {
    const res = await makeRequest('/api-docs', 'GET');
    assert.equal(res.status, 200);
    assert.equal(res.body.openapi, '3.0.0');
  });
});
