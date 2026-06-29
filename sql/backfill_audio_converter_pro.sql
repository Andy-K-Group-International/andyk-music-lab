-- Backfill: grant audio-converter access to all existing active Pro Pass users.
-- Run this ONCE manually via the Supabase SQL editor after deploying the Audio Converter tool.
-- Safe to re-run — ON CONFLICT DO NOTHING prevents duplicate rows.

INSERT INTO tool_access (user_id, tool_name, granted_at, expires_at)
SELECT
  p.id,
  'audio-converter',
  now(),
  p.plan_expires_at
FROM profiles p
WHERE
  p.plan = 'pro'
  AND p.subscription_status = 'active'
  AND (p.plan_expires_at IS NULL OR p.plan_expires_at > now())
ON CONFLICT DO NOTHING;
