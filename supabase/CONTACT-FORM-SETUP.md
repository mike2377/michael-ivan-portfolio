# Contact form setup

The browser calls the `contact-message` Supabase Edge Function. The function validates the submission, applies a honeypot and per-IP rate limit, stores the message in `public.contact_messages`, then attempts an email notification through Resend. The visitor sees full success only after the database confirms the stored row and Resend accepts the notification request. If notification setup or delivery fails, the row remains stored and the visitor is told that the notification was not queued or could not be confirmed.

The browser uses only the Supabase project URL and public anon/publishable key. The function uses Supabase's server-provided service-role key for database access and keeps the Resend key on the server. Do not add a service-role key or Resend key to a `VITE_` variable.

## Supabase project setup

1. Create or choose the Supabase project that will receive portfolio messages.
2. Link this checkout to that project with the Supabase CLI, review the complete migration sequence, then apply it with `supabase db push`. The original `contact_messages` table migration must run before `20261117100000_secure_contact_form.sql`, followed by `20261117120000_harden_contact_form_permissions.sql`. The repository migration does not prove that a hosted project has already run it.
3. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the local Vite environment and in the static hosting provider's build environment. `.env.example` contains placeholders; copy it to `.env.local` locally and replace them with the project's URL and public key.
4. Deploy the Edge Function with `supabase functions deploy contact-message --project-ref <project-ref>` (or use the linked project). `supabase/config.toml` sets `verify_jwt = false` because this is a public visitor form. The handler applies its own origin allow-list, validation, honeypot, and rate limit; this setting is not authentication.

The server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected by Supabase Edge Functions. The contact-form hardening migration enables RLS, revokes all table privileges from `PUBLIC`, `anon`, and `authenticated`, then grants only the `service_role` privileges needed by the function. The rate-limit table has RLS enabled and no public table permissions. Its RPC is executable only by `service_role` and uses a restricted `search_path`.

Before applying migrations to an existing hosted project, verify that `public.contact_messages` and `public.contact_submission_limits` have the expected columns, that `contact_messages_submission_key_uidx` exists and is unique, and that no custom roles or service policies are relied on. The hardening migration preserves message rows but intentionally removes direct access for public roles. Do not roll it back by dropping either table; doing so would destroy messages and rate-limit state. If rollback is necessary, prepare a reviewed forward migration that restores only the specific access required.

## Email notification setup

Resend is used through its HTTPS API, so no additional application dependency is needed. Its current free transactional plan advertises up to 3,000 emails per month and 100 per day; check [Resend pricing](https://resend.com/pricing) for current limits. Sending from a production address requires a Resend account, API key, and verified sending domain. A paid plan is not required within the advertised free quota, but domain ownership and DNS verification are still required.

1. In Resend, create an API key and verify a domain you control, including the provider's requested DNS records.
2. Choose a sender address on that verified domain and set these values as **Supabase Edge Function secrets** (Dashboard → Edge Functions → Secrets, or `supabase secrets set`):
   - `RESEND_API_KEY` — private Resend API key.
   - `CONTACT_FROM_EMAIL` — sender name/address on the verified domain, for example `Michael Ivan <contact@your-domain>`.
   - `CONTACT_TO_EMAIL` — inbox that should receive notifications.
   - `CONTACT_ALLOWED_ORIGINS` — comma-separated, exact scheme-and-host origins for the deployed site. Include local Vite origins only while developing. Do not include URL paths or trailing slashes.
   - `RATE_LIMIT_HMAC_SECRET` — long random secret used to hash the forwarded client IP before the rate-limit hash is stored.
3. For local Edge Function work, copy `supabase/functions/.env.example` to `supabase/functions/.env`, fill in the values, and run `supabase start` followed by `supabase functions serve contact-message`. The `.env` file is ignored; never commit it.
4. Check the Edge Function logs and Resend email logs after deployment. The function stores `notification_status` as `queued`, `failed`, or `not_configured`. `queued` means Resend accepted the API request; it does not guarantee final mailbox delivery.

The function sends plain-text email and sets `reply_to` to the visitor's validated address. It does not send an automatic confirmation to the visitor. A message is still saved if Resend is unavailable; the response then says the message was saved but the notification was not queued, and the row remains available in the Supabase dashboard. Notification status is stored as `queued`, `failed`, `not_configured`, or `pending` when a status update could not be confirmed. Only the request that inserts a new message attempts its notification. A duplicate submission-key retry checks that the stored content matches and returns its current notification status without starting another email attempt.

## Privacy and abuse controls

The form tells visitors that their name, email address, subject, and message are stored in Supabase, that the Edge Function processes the forwarded network address to derive a keyed hash for rate limiting, that Resend receives the message when notifications are configured, and that automatic message deletion is not configured. The form asks visitors not to send confidential or sensitive information. No legal-compliance claim is made.

The server rejects a filled honeypot and allows up to five valid submissions per IP per hour. Supabase's Edge Function guidance uses the first `X-Forwarded-For` entry as the client IP; this function uses only that header, validates and canonicalizes its first address, and fails closed if it is missing or malformed. Confirm this header behavior on the deployed Supabase project before relying on the limit. It stores only a keyed HMAC hash in the private rate-limit table. Rows older than 48 hours are deleted when a later valid submission invokes the rate-limit function; this is opportunistic cleanup, not a guaranteed 48-hour TTL. This is a lightweight deterrent, not a guarantee against a determined bot or a distributed attack.

The database enforces a unique submission key. A retry with the same key is accepted only when its normalized name, email, subject, and message match the stored row. A different payload with that key receives a conflict response. The function reads stored content only for this server-side comparison and never returns another submission's message to the caller. The browser retains the key only until the page is reloaded or the visitor edits the fields.

The browser limits each contact request to 20 seconds. A timeout or lost response is treated as an uncertain outcome: the form keeps its values and submission key, and the visitor can retry without editing. The database uniqueness constraint and content comparison prevent the same key from creating another message. The key is held in the current page session only; a page reload loses it, so visitors should not refresh after an uncertain result. No scheduled notification retry or message-retention policy is configured. Review pending/failed notification statuses operationally, and decide how long contact messages should be retained before enabling the production form.

## Operational checklist

- Apply the new SQL migration to the intended Supabase project.
- Verify the actual hosted schema, grants, RLS policies, and forwarded-IP behavior before relying on the edge rate limit.
- Configure the frontend's public Supabase URL/key in the hosting build environment.
- Set the Edge Function secrets above; verify the `CONTACT_ALLOWED_ORIGINS` entry exactly matches the production site origin.
- Verify the Resend sender domain and deploy `contact-message`.
- Send a controlled test from the deployed site only after the database, recipient, and provider are configured; confirm the stored row, notification status, and inbox delivery.

No hosted Supabase project, Resend account, verified sender domain, provider key, or production host is configured by this repository change. The function and SQL changes require deployment and environment-specific tests before production use.

## Local security-helper tests

With Node.js 22.6 or later, run `node --experimental-strip-types supabase/functions/contact-message/security.test.mjs` and `node --experimental-strip-types src/lib/contactRequest.test.mjs`. These dependency-free tests cover JSON stream size enforcement, payload validation, key/content matching, IP parsing, and the browser request timeout helper. They do not exercise React interactions, Supabase, SQL concurrency, Edge Runtime headers, Resend, or real delivery; those require local mocks or a local/hosted Supabase test environment.
