export const contactRequestTimeoutMs = 20_000;

export function createTimeoutFetch(
  timeoutMs: number,
  fetchImplementation: typeof fetch = fetch,
): typeof fetch {
  return async (input, init) => {
    const controller = new AbortController();
    const forwardAbort = () => controller.abort(init?.signal?.reason);
    if (init?.signal?.aborted) forwardAbort();
    else init?.signal?.addEventListener('abort', forwardAbort, { once: true });

    const timer = setTimeout(() => {
      controller.abort(new DOMException('Contact request timed out.', 'TimeoutError'));
    }, timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      init?.signal?.removeEventListener('abort', forwardAbort);
    };

    let response: Response;
    try {
      response = await fetchImplementation(input, { ...init, signal: controller.signal });
    } catch (error) {
      cleanup();
      throw error;
    }

    if (!response.body || [204, 205, 304].includes(response.status)) {
      cleanup();
      return response;
    }

    const reader = response.body.getReader();
    const body = new ReadableStream<Uint8Array>({
      async pull(streamController) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            cleanup();
            streamController.close();
          } else {
            streamController.enqueue(value);
          }
        } catch (error) {
          cleanup();
          streamController.error(error);
        }
      },
      async cancel(reason) {
        controller.abort(reason);
        cleanup();
        await reader.cancel(reason);
      },
    });

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  };
}
