import test from 'node:test';
import assert from 'node:assert/strict';
import { createTimeoutFetch } from './contactRequest.ts';

test('aborts a contact request when its deadline expires', async () => {
  const timeoutFetch = createTimeoutFetch(10, (_input, init) => new Promise((_, reject) => {
    init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true });
  }));

  await assert.rejects(
    timeoutFetch('https://example.test'),
    (error) => error.name === 'TimeoutError',
  );
});

test('clears the timeout after a response and forwards a caller abort', async () => {
  let receivedSignal;
  const timeoutFetch = createTimeoutFetch(10_000, async (_input, init) => {
    receivedSignal = init.signal;
    return new Response('ok');
  });
  const response = await timeoutFetch('https://example.test');
  assert.equal(await response.text(), 'ok');
  assert.equal(receivedSignal.aborted, false);

  const caller = new AbortController();
  const waitingFetch = createTimeoutFetch(10_000, (_input, init) => new Promise((_, reject) => {
    init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true });
  }));
  const pending = waitingFetch('https://example.test', { signal: caller.signal });
  caller.abort(new DOMException('Cancelled', 'AbortError'));
  await assert.rejects(pending, (error) => error.name === 'AbortError');
});

test('preserves network failures without converting them into false success', async () => {
  const timeoutFetch = createTimeoutFetch(10_000, async () => {
    throw new TypeError('Network unavailable');
  });
  await assert.rejects(timeoutFetch('https://example.test'), /Network unavailable/);
});

test('keeps the deadline active while the response body is still streaming', async () => {
  const timeoutFetch = createTimeoutFetch(10, async (_input, init) => new Response(new ReadableStream({
    start(controller) {
      init.signal.addEventListener('abort', () => controller.error(init.signal.reason), { once: true });
    },
  })));
  const response = await timeoutFetch('https://example.test');
  await assert.rejects(response.text(), (error) => error.name === 'TimeoutError');
});
