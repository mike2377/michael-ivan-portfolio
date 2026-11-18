-- Tighten only the contact-message access boundary and the rate-limit helper.
-- Apply through the Supabase migration runner after confirming the live schema.

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_insert_contact_messages" ON public.contact_messages;
REVOKE ALL ON TABLE public.contact_messages FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.contact_messages TO service_role;

CREATE OR REPLACE FUNCTION public.consume_contact_submission_limit(
  p_ip_hash text,
  p_max_submissions integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  current_count integer;
  current_time timestamptz := pg_catalog.clock_timestamp();
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
      WHEN limits.window_started_at <= current_time - pg_catalog.make_interval(secs => p_window_seconds)
        THEN current_time
      ELSE limits.window_started_at
    END,
    submission_count = CASE
      WHEN limits.window_started_at <= current_time - pg_catalog.make_interval(secs => p_window_seconds)
        THEN 1
      ELSE limits.submission_count + 1
    END,
    last_seen_at = current_time
  RETURNING submission_count INTO current_count;

  RETURN current_count <= p_max_submissions;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_contact_submission_limit(text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_contact_submission_limit(text, integer, integer)
  TO service_role;
