-- ============================================================================
-- DotNetForge — production hardening (runs after 01-schema.sql / 02-seed.sql).
--
-- The seed ships a well-known demo account for local development. It must not
-- exist in a production database, so we remove it and any progress it owns.
-- ============================================================================
BEGIN;

DELETE FROM lesson_progress
 WHERE user_id IN (SELECT id FROM users WHERE email = 'demo@dotnetforge.dev');
DELETE FROM capstone_progress
 WHERE user_id IN (SELECT id FROM users WHERE email = 'demo@dotnetforge.dev');
DELETE FROM users WHERE email = 'demo@dotnetforge.dev';

COMMIT;
