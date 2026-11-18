// Supabase Edge Function: stores contact messages before attempting notification.
// The function is public by design; enforce origin, validation, honeypot, and rate limits here.
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { getTrustedClientIp, matchesStoredContent, parseContactPayload, readJsonBody } from './security.ts';
import type { ContactPayload } from './security.ts';

const maxBodyBytes = 12_000;
const rateLimitMax = 5;
const rateLimitWindowSeconds = 60 * 60;

function allowedOrigins(): Set<string> {
  return new Set(
    (Deno.env.get('CONTACT_ALLOWED_ORIGINS') ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

function corsHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json; charset=utf-8',
    Vary: 'Origin',
  };
}

function jsonResponse(body: Record<string, unknown>, status: number, origin?: string): Response {
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8', Vary: 'Origin' });
  if (origin && allowedOrigins().has(origin)) {
    for (const [name, value] of Object.entries(corsHeaders(origin))) headers.set(name, value);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

async function hashClientIp(ip: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(ip));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sendNotification(
  payload: ContactPayload,
  apiKey: string,
  from: string,
  to: string,
): Promise<boolean> {
  const safeSubject = payload.subject.replace(/[\r\n]+/g, ' ').trim();
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `portfolio-contact/${payload.submissionKey}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: payload.email,
      subject: `Portfolio contact: ${safeSubject}`,
      text: `Name: ${payload.name}\nEmail: ${payload.email}\nSubject: ${safeSubject}\n\n${payload.message}`,
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) console.error('Contact notification provider returned status', response.status);
  return response.ok;
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin') ?? '';
  const origins = allowedOrigins();

  if (origins.size === 0) return jsonResponse({ error: 'Contact endpoint is not configured.', code: 'unavailable', outcome: 'not_stored' }, 503, origin);
  if (!origins.has(origin)) return jsonResponse({ error: 'Origin is not allowed.', code: 'origin_rejected', outcome: 'not_stored' }, 403);

  if (request.method === 'OPTIONS') return new Response('ok', { status: 200, headers: corsHeaders(origin) });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405, origin);

  const bodyResult = await readJsonBody(request, maxBodyBytes);
  if (!bodyResult.ok) {
    return bodyResult.reason === 'too_large'
      ? jsonResponse({ error: 'Submission is too large.', code: 'invalid_submission', outcome: 'not_stored' }, 413, origin)
      : jsonResponse({ error: 'Invalid request body.', code: 'invalid_submission', outcome: 'not_stored' }, 400, origin);
  }
  const input = bodyResult.value;

  if (input && typeof input === 'object' && 'website' in input && typeof input.website === 'string' && input.website.trim()) {
    return jsonResponse({ error: 'Submission could not be accepted.', code: 'submission_rejected', outcome: 'not_stored' }, 400, origin);
  }

  const payload = parseContactPayload(input);
  if (!payload) return jsonResponse({ error: 'Please check the form fields and try again.', code: 'invalid_submission', outcome: 'not_stored' }, 400, origin);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  let serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceRoleKey) {
    try {
      const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}') as Record<string, string>;
      serviceRoleKey = keys.default;
    } catch {
      serviceRoleKey = undefined;
    }
  }
  const rateLimitSecret = Deno.env.get('RATE_LIMIT_HMAC_SECRET');
  if (!supabaseUrl || !serviceRoleKey || !rateLimitSecret) {
    console.error('Contact storage or rate-limit configuration is missing.');
    return jsonResponse({ error: 'The contact form is temporarily unavailable.', code: 'unavailable', outcome: 'not_stored' }, 503, origin);
  }

  const clientIp = getTrustedClientIp(request);
  if (!clientIp) return jsonResponse({ error: 'The contact form is temporarily unavailable.', code: 'unavailable', outcome: 'not_stored' }, 503, origin);

  try {
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const ipHash = await hashClientIp(clientIp, rateLimitSecret);
    const { data: withinLimit, error: rateLimitError } = await admin.rpc('consume_contact_submission_limit', {
      p_ip_hash: ipHash,
      p_max_submissions: rateLimitMax,
      p_window_seconds: rateLimitWindowSeconds,
    });

    if (rateLimitError) {
      console.error('Contact rate-limit check failed.');
      return jsonResponse({ error: 'The contact form is temporarily unavailable.', code: 'rate_limit_unavailable', outcome: 'not_stored' }, 503, origin);
    }
    if (!withinLimit) return jsonResponse({ error: 'Too many messages. Please wait before trying again.', code: 'rate_limited', outcome: 'not_stored' }, 429, origin);

    const { data: insertedMessage, error: insertError } = await admin
      .from('contact_messages')
      .upsert(
        {
          submission_key: payload.submissionKey,
          name: payload.name,
          email: payload.email,
          subject: payload.subject,
          message: payload.message,
          notification_status: 'pending',
        },
        { onConflict: 'submission_key', ignoreDuplicates: true },
      )
      .select('id, notification_status')
      .maybeSingle();

    if (insertError) {
      console.error('Contact message could not be stored.');
      return jsonResponse({ error: 'Your message could not be saved. Please try again or email me directly.', code: 'storage_unconfirmed', outcome: 'unknown' }, 500, origin);
    }

    let message = insertedMessage;
    if (!message) {
      const { data: existingMessage, error: existingMessageError } = await admin
        .from('contact_messages')
        .select('id, notification_status, name, email, subject, message')
        .eq('submission_key', payload.submissionKey)
        .single();

      if (existingMessageError || !existingMessage) {
        console.error('An idempotent contact message could not be retrieved.');
        return jsonResponse({ error: 'Your message could not be confirmed. Please try again or email me directly.', code: 'storage_unconfirmed', outcome: 'unknown' }, 500, origin);
      }
      if (!matchesStoredContent(payload, existingMessage)) {
        return jsonResponse({ error: 'This submission key is already associated with a different message.', code: 'submission_conflict', outcome: 'not_stored' }, 409, origin);
      }
      const existingNotificationStatus = existingMessage.notification_status === 'queued'
        ? 'queued'
        : existingMessage.notification_status === 'pending'
          ? 'pending'
          : existingMessage.notification_status === 'failed'
            ? 'failed'
            : 'not_configured';
      return jsonResponse({ stored: true, notificationStatus: existingNotificationStatus }, 200, origin);
    }

    // Only the request that inserted a new row may attempt its notification.
    // Public retries confirm storage but cannot trigger another email attempt.
    message = insertedMessage;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const from = Deno.env.get('CONTACT_FROM_EMAIL');
    const to = Deno.env.get('CONTACT_TO_EMAIL');
    let notificationQueued = false;

    if (resendApiKey && from && to) {
      try {
        notificationQueued = await sendNotification(payload, resendApiKey, from, to);
      } catch {
        console.error('Contact notification request failed or timed out.');
      }
    }

    const notificationStatus = notificationQueued
      ? 'queued'
      : resendApiKey && from && to
        ? 'failed'
        : 'not_configured';
    const { error: statusError } = await admin
      .from('contact_messages')
      .update({ notification_status: notificationStatus })
      .eq('id', message.id);

    if (statusError) console.error('Contact notification status could not be updated.');

    return jsonResponse({
      stored: true,
      notificationStatus: statusError ? 'pending' : notificationStatus,
    }, 201, origin);
  } catch {
    console.error('Unexpected contact form processing error.');
    return jsonResponse({ error: 'Your message could not be confirmed. Please try again or email me directly.', code: 'processing_unconfirmed', outcome: 'unknown' }, 500, origin);
  }
});
