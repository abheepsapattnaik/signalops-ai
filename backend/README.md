# SignalOps AI Backend

This folder contains the Java Spring Boot backend for the SignalOps AI application.

## Stack
- Java 25
- Spring Boot 3.5.16
- PostgreSQL 16
- Spring Data JPA

## Run locally

1. Start PostgreSQL:
   ```bash
   docker compose up -d
   ```

2. Store AI provider settings in PostgreSQL (preferred):
   ```sql
   INSERT INTO app_settings (setting_key, setting_value, updated_at)
   VALUES
     ('AI_API_KEY', 'your_provider_key', NOW()),
     ('AI_MODEL', 'openrouter/auto', NOW()),
     ('AI_BASE_URL', 'https://openrouter.ai/api/v1', NOW());
   ```

   If you want a shell fallback instead, you can also set:
   ```bash
   export AI_API_KEY=your_provider_key
   export AI_MODEL=openrouter/auto
   export AI_BASE_URL=https://openrouter.ai/api/v1
   ```

3. Start the app:
   ```bash
   ./mvnw spring-boot:run
   ```

   If Maven wrapper is not present, use:
   ```bash
   mvn spring-boot:run
   ```

4. Seed AI provider values in PostgreSQL (recommended):
   ```bash
   docker exec -i signalops-ai-postgres psql -U signalops -d signalops_ai < backend/scripts/seed_app_settings.sql
   ```

   Edit `backend/scripts/seed_app_settings.sql` first and replace the placeholder API key with your provider value.

   Alternative manual SQL:
   ```sql
   INSERT INTO app_settings (setting_key, setting_value, updated_at)
   VALUES
     ('AI_API_KEY', '<your_provider_key>', NOW()),
     ('AI_MODEL', 'openrouter/auto', NOW()),
     ('AI_BASE_URL', 'https://openrouter.ai/api/v1', NOW())
   ON CONFLICT (setting_key) DO UPDATE
   SET setting_value = EXCLUDED.setting_value,
       updated_at = NOW();
   ```

5. API endpoints:
   - `GET /api/health`
   - `POST /api/ai`
   - `POST /api/insights/generate`

## Example request

```json
{
  "prompt": "We need a clearer AI-driven operating model for delivery and reliability.",
  "productIdea": "A platform that helps engineering teams triage incidents and improve operational clarity.",
  "team": "Platform & AI Ops",
  "source": "AI"
}
```

## Database
The app connects to PostgreSQL using the settings in `src/main/resources/application.yml`.
