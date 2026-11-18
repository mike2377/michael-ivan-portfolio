-- Route public contact submissions through the Edge Function instead of allowing
-- browsers to insert directly into the messages table.
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS submission_key uuid,
  ADD COLUMN IF NOT EXISTS notification_status text NOT NULL DEFAULT 'not_configured';

CREATE UNIQUE INDEX IF NOT EXISTS contact_messages_submission_key_uidx
  ON public.contact_messages (submission_key);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'contact_messages_notification_status_check'
      AND conrelid = 'public.contact_messages'::regclass
  ) THEN
    ALTER TABLE public.contact_messages
      ADD CONSTRAINT contact_messages_notification_status_check
      CHECK (notification_status IN ('pending', 'queued', 'failed', 'not_configured'));
  END IF;
END;
$$;

DROP POLICY IF EXISTS "anon_insert_contact_messages" ON public.contact_messages;
REVOKE INSERT ON public.contact_messages FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.contact_messages TO service_role;

CREATE TABLE IF NOT EXISTS public.contact_submission_limits (
  ip_hash text PRIMARY KEY CHECK (ip_hash ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz NOT NULL,
  submission_count integer NOT NULL CHECK (submission_count > 0),
  last_seen_at timestamptz NOT NULL
);

ALTER TABLE public.contact_submission_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.contact_submission_limits FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_submission_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_contact_submission_limit(
  p_ip_hash text,
  p_max_submissions integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_count integer;
  current_time timestamptz := clock_timestamp();
BEGIN
  IF p_ip_hash !~ '^[0-9a-f]{64}$'
    OR p_max_submissions < 1
    OR p_max_submissions > 100
    OR p_window_seconds < 60
    OR p_window_seconds > 86400 THEN
    RETURN false;
  END IF;

  DELETE FROM public.contact_submission_limits
  WHERE last_seen_at < current_time - interval '48 hours';

  INSERT INTO public.contact_submission_limits AS limits (
    ip_hash,
    window_started_at,
    submission_count,
    last_seen_at
  )
  VALUES (p_ip_hash, current_time, 1, current_time)
  ON CONFLICT (ip_hash) DO UPDATE
  SET
    window_started_at = CASE
      WHEN limits.window_started_at <= current_time - make_interval(secs => p_window_seconds)
        THEN current_time
      ELSE limits.window_started_at
    END,
    submission_count = CASE
      WHEN limits.window_started_at <= current_time - make_interval(secs => p_window_seconds)
        THEN 1
      ELSE limits.submission_count + 1
    END,
    last_seen_at = current_time
  RETURNING submission_count INTO current_count;

  RETURN current_count <= p_max_submissions;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_contact_submission_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_contact_submission_limit(text, integer, integer) TO service_role;
