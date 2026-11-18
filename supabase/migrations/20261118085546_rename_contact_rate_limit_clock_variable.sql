CREATE OR REPLACE FUNCTION public.consume_contact_submission_limit(
  p_ip_hash text,
  p_max_submissions integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'pg_temp'
AS $$
DECLARE
  current_count integer;
  v_now timestamptz := pg_catalog.clock_timestamp();
BEGIN
  IF p_ip_hash !~ '^[0-9a-f]{64}$'
    OR p_max_submissions < 1
    OR p_max_submissions > 100
    OR p_window_seconds < 60
    OR p_window_seconds > 86400 THEN
    RETURN false;
  END IF;

  DELETE FROM public.contact_submission_limits
  WHERE last_seen_at < v_now - interval '48 hours';

  INSERT INTO public.contact_submission_limits AS limits (
    ip_hash,
    window_started_at,
    submission_count,
    last_seen_at
  )
  VALUES (p_ip_hash, v_now, 1, v_now)
  ON CONFLICT (ip_hash) DO UPDATE
  SET
    window_started_at = CASE
      WHEN limits.window_started_at <= v_now - pg_catalog.make_interval(secs => p_window_seconds)
        THEN v_now
      ELSE limits.window_started_at
    END,
    submission_count = CASE
      WHEN limits.window_started_at <= v_now - pg_catalog.make_interval(secs => p_window_seconds)
        THEN 1
      ELSE limits.submission_count + 1
    END,
    last_seen_at = v_now
  RETURNING submission_count INTO current_count;

  RETURN current_count <= p_max_submissions;
END;
$$;
