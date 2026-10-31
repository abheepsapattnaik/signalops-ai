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

2. Start the app:
   ```bash
   ./mvnw spring-boot:run
   ```

   If Maven wrapper is not present, use:
   ```bash
   mvn spring-boot:run
   ```

3. API endpoints:
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
