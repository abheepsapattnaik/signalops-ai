-- Seed AI provider configuration for the SignalOps AI backend.
-- Usage:
--   docker exec -i signalops-ai-postgres psql -U signalops -d signalops_ai < backend/scripts/seed_app_settings.sql
-- Replace the placeholder values below before running.

INSERT INTO app_settings (setting_key, setting_value, updated_at)
VALUES
  ('AI_API_KEY', '<your_provider_key>', NOW()),
  ('AI_MODEL', 'openrouter/auto', NOW()),
  ('AI_BASE_URL', 'https://openrouter.ai/api/v1', NOW())
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value,
    updated_at = NOW();
