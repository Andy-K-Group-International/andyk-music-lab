-- Backfill: grant audio-converter access to all existing active Pro Pass users.
-- Run this manually via the Supabase SQL editor after deploying the Audio Converter tool.
-- Safe to re-run — WHERE NOT EXISTS prevents duplicate rows (no unique constraint exists on tool_access).

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
  AND NOT EXISTS (
    SELECT 1 FROM tool_access ta
    WHERE ta.user_id = p.id AND ta.tool_name = 'audio-converter'
  );
