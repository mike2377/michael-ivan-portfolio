import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimitDiagnostics, getTrustedClientIp, matchesStoredContent, normalizeIpAddress, parseContactPayload, readJsonBody } from './security.ts';

const validPayload = {
  submissionKey: '123e4567-e89b-42d3-a456-426614174000',
  name: 'Test Visitor',
  email: 'visitor@example.test',
  subject: 'Project inquiry',
  message: 'I would like to discuss a project.',
};

test('validates and normalizes submitted contact fields', () => {
  assert.equal(parseContactPayload({ ...validPayload, name: ' Test Visitor ' }).name, 'Test Visitor');
  assert.equal(parseContactPayload({ ...validPayload, submissionKey: 'not-a-uuid' }), null);
  assert.equal(parseContactPayload({ name: 'Only one field' }), null);
});

test('rejects content changes when a retry key is reused', () => {
  const payload = parseContactPayload(validPayload);
  assert.ok(payload);
  assert.equal(matchesStoredContent(payload, payload), true);
  assert.equal(matchesStoredContent(payload, { ...payload, message: 'Different message content.' }), false);
});

test('enforces actual streamed body size when Content-Length is absent or understated', async () => {
  const body = JSON.stringify(validPayload);
  const noLength = new Request('https://example.test', { method: 'POST', body });
  assert.deepEqual(await readJsonBody(noLength, body.length - 1), { ok: false, reason: 'too_large' });

  const underestimated = new Request('https://example.test', {
    method: 'POST',
    headers: { 'content-length': '1' },
    body,
  });
  assert.deepEqual(await readJsonBody(underestimated, body.length - 1), { ok: false, reason: 'too_large' });
});

test('rejects invalid JSON and oversized declared lengths', async () => {
  const invalidJson = new Request('https://example.test', { method: 'POST', body: '{' });
  assert.deepEqual(await readJsonBody(invalidJson, 100), { ok: false, reason: 'invalid_json' });

  const largeDeclared = new Request('https://example.test', {
    method: 'POST',
    headers: { 'content-length': '1001' },
    body: '{}',
  });
  assert.deepEqual(await readJsonBody(largeDeclared, 1000), { ok: false, reason: 'too_large' });
});

test('accepts and canonicalizes IPv4 and IPv6 client addresses', () => {
  assert.equal(normalizeIpAddress('203.0.113.7'), '203.0.113.7');
  assert.equal(normalizeIpAddress('2001:db8::1'), '2001:0db8:0000:0000:0000:0000:0000:0001');
  assert.equal(normalizeIpAddress('::ffff:203.0.113.7'), '203.0.113.7');
  assert.equal(normalizeIpAddress('999.1.1.1'), null);
  assert.equal(normalizeIpAddress('2001:::1'), null);
});

test('uses only the first Supabase X-Forwarded-For address and rejects alternate headers', () => {
  const forwarded = new Request('https://example.test', {
    headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1', 'x-real-ip': '198.51.100.8' },
  });
  assert.equal(getTrustedClientIp(forwarded), '203.0.113.7');

  const alternateOnly = new Request('https://example.test', { headers: { 'x-real-ip': '203.0.113.7' } });
  assert.equal(getTrustedClientIp(alternateOnly), null);

  const malformed = new Request('https://example.test', { headers: { 'x-forwarded-for': 'not-an-ip, 203.0.113.7' } });
  assert.equal(getTrustedClientIp(malformed), null);
});

test('rate-limit diagnostics exclude arbitrary RPC messages and retain only validated metadata', () => {
  const sensitiveMessages = [
    'Bearer eyJhbGciOiJIUzI1NiJ9.secret.signature',
    'API key sb_secret_private-value',
    'Client address 2001:db8::1',
    'Contact visitor@example.test',
    'Personal information: Michael Ivan, private inquiry',
  ];
  const error = Object.assign(new Error(sensitiveMessages.join(' | ')), {
    code: '42501',
    status: 403,
    details: sensitiveMessages.join(' | '),
    hint: sensitiveMessages.join(' | '),
    stack: sensitiveMessages.join(' | '),
  });
  const diagnostics = createRateLimitDiagnostics(error, {
    authenticationPath: 'secret-key fallback',
    serviceRoleKeyPresent: false,
    secretKeysPresent: true,
  });
  const serialized = JSON.stringify(diagnostics);

  assert.deepEqual(diagnostics, {
    errorCode: '42501',
    httpStatus: 403,
    authenticationPath: 'secret-key fallback',
    serviceRoleKeyPresent: false,
    secretKeysPresent: true,
  });
  for (const message of sensitiveMessages) assert.equal(serialized.includes(message), false);
  assert.equal('message' in diagnostics, false);
});

test('rate-limit diagnostics omit invalid code and HTTP status values', () => {
  assert.deepEqual(createRateLimitDiagnostics({ code: 'Bearer token', status: 700 }, {
    authenticationPath: 'legacy',
    serviceRoleKeyPresent: true,
    secretKeysPresent: false,
  }), {
    errorCode: undefined,
    httpStatus: undefined,
    authenticationPath: 'legacy',
    serviceRoleKeyPresent: true,
    secretKeysPresent: false,
  });
});
