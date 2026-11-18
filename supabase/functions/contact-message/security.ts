export interface ContactPayload {
  submissionKey: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
}

export type RateLimitAuthenticationPath = 'legacy' | 'secret-key fallback';

export function createRateLimitDiagnostics(
  error: unknown,
  configuration: {
    authenticationPath: RateLimitAuthenticationPath;
    serviceRoleKeyPresent: boolean;
    secretKeysPresent: boolean;
  },
): {
  errorCode: string | undefined;
  httpStatus: number | undefined;
  authenticationPath: RateLimitAuthenticationPath;
  serviceRoleKeyPresent: boolean;
  secretKeysPresent: boolean;
} {
  const errorFields = error && typeof error === 'object' ? error as Record<string, unknown> : {};
  const code = errorFields.code;
  const status = errorFields.status;

  return {
    errorCode: typeof code === 'string' && /^[A-Z0-9_-]{1,32}$/i.test(code) ? code : undefined,
    httpStatus: typeof status === 'number' && Number.isInteger(status) && status >= 100 && status <= 599
      ? status
      : undefined,
    authenticationPath: configuration.authenticationPath,
    serviceRoleKeyPresent: configuration.serviceRoleKeyPresent,
    secretKeysPresent: configuration.secretKeysPresent,
  };
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseContactPayload(value: unknown): ContactPayload | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  const fields = ['submissionKey', 'name', 'email', 'subject', 'message'];
  if (fields.some((field) => typeof input[field] !== 'string')) return null;

  const payload: ContactPayload = {
    submissionKey: (input.submissionKey as string).trim(),
    name: (input.name as string).trim(),
    email: (input.email as string).trim(),
    subject: (input.subject as string).trim(),
    message: (input.message as string).trim(),
    website: typeof input.website === 'string' ? input.website.trim() : '',
  };

  if (!uuidPattern.test(payload.submissionKey)) return null;
  if (!payload.name || payload.name.length > 100) return null;
  if (!emailPattern.test(payload.email) || payload.email.length > 254) return null;
  if (!payload.subject || payload.subject.length > 150) return null;
  if (payload.message.length < 10 || payload.message.length > 2000) return null;
  return payload;
}

export function matchesStoredContent(
  payload: ContactPayload,
  stored: Pick<ContactPayload, 'name' | 'email' | 'subject' | 'message'>,
): boolean {
  return (
    payload.name === stored.name &&
    payload.email === stored.email &&
    payload.subject === stored.subject &&
    payload.message === stored.message
  );
}

export type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; reason: 'too_large' | 'invalid_json' };

export async function readJsonBody(request: Request, maxBytes: number): Promise<JsonBodyResult> {
  const contentLength = request.headers.get('content-length');
  if (contentLength !== null) {
    if (!/^\d+$/.test(contentLength)) return { ok: false, reason: 'invalid_json' };
    const declaredLength = Number(contentLength);
    if (!Number.isSafeInteger(declaredLength)) return { ok: false, reason: 'too_large' };
    if (declaredLength > maxBytes) return { ok: false, reason: 'too_large' };
  }

  const reader = request.body?.getReader();
  if (!reader) return { ok: false, reason: 'invalid_json' };

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, reason: 'too_large' };
      }
      chunks.push(value);
    }

    const body = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const text = new TextDecoder('utf-8', { fatal: true }).decode(body);
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, reason: 'invalid_json' };
  }
}

function normalizeIpv4(value: string): string | null {
  const parts = value.split('.');
  if (parts.length !== 4) return null;
  const octets: number[] = [];
  for (const part of parts) {
    if (!/^(0|[1-9]\d{0,2})$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    octets.push(octet);
  }
  return octets.join('.');
}

export function normalizeIpAddress(value: string): string | null {
  const address = value.trim();
  if (!address || address.includes('%')) return null;
  if (!address.includes(':')) return normalizeIpv4(address);

  let normalizedInput = address;
  if (address.includes('.')) {
    const lastColon = address.lastIndexOf(':');
    if (lastColon < 0) return null;
    const ipv4 = normalizeIpv4(address.slice(lastColon + 1));
    if (!ipv4) return null;
    const octets = ipv4.split('.').map(Number);
    const high = ((octets[0] << 8) | octets[1]).toString(16);
    const low = ((octets[2] << 8) | octets[3]).toString(16);
    normalizedInput = `${address.slice(0, lastColon + 1)}${high}:${low}`;
  }

  const compressionIndex = normalizedInput.indexOf('::');
  if (compressionIndex !== normalizedInput.lastIndexOf('::')) return null;
  const compressed = compressionIndex >= 0;
  const leftText = compressed ? normalizedInput.slice(0, compressionIndex) : normalizedInput;
  const rightText = compressed ? normalizedInput.slice(compressionIndex + 2) : '';
  const left = leftText ? leftText.split(':') : [];
  const right = rightText ? rightText.split(':') : [];
  const groups = [...left, ...right];
  if (groups.some((group) => !/^[0-9a-f]{1,4}$/i.test(group))) return null;
  if (compressed ? groups.length >= 8 : groups.length !== 8) return null;

  const missing = compressed ? 8 - groups.length : 0;
  const expanded = [...left, ...Array(missing).fill('0'), ...right].map((group) => parseInt(group, 16));
  if (expanded.length !== 8) return null;

  if (expanded.slice(0, 5).every((group) => group === 0) && expanded[5] === 0xffff) {
    return `${expanded[6] >> 8}.${expanded[6] & 255}.${expanded[7] >> 8}.${expanded[7] & 255}`;
  }

  return expanded.map((group) => group.toString(16).padStart(4, '0')).join(':');
}

// Supabase's Edge Function examples use the first X-Forwarded-For entry as the client IP.
// Ignore alternate forwarding headers and reject malformed values instead of falling back.
export function getTrustedClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (!forwardedFor) return null;
  const firstAddress = forwardedFor.split(',')[0]?.trim();
  return firstAddress ? normalizeIpAddress(firstAddress) : null;
}
