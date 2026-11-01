# SignalOps AI

A full-stack AI portfolio project designed for a tech lead interview narrative. It combines product thinking, platform operations, and AI-assisted decision-making in one polished web application.

## Why this project matters

This app is built to demonstrate that I can:

- lead full-stack product development with clear architectural thinking
- use AI to improve team workflows instead of replacing human judgment
- connect engineering execution to customer impact and operational health
- present a portfolio project that feels like a real leadership scenario, not a toy demo

## Product concept

SignalOps AI is a leadership command center for engineering and platform teams. It helps teams:

- summarize noisy operational signals
- prioritize initiatives based on risk and business value
- understand delivery confidence before launch
- support faster, more informed decision-making with AI-generated recommendations

## Tech stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Server-side API routes for AI insight generation
- Responsive design for portfolio and demonstration use

## Project structure

```bash
backend/
  # Java Spring Boot service
frontend/
  src/
    app/
      api/ai/route.ts
      dashboard/page.tsx
      globals.css
      layout.tsx
      page.tsx
    lib/
      ai.ts
  public/
  package.json
  next.config.ts
  tsconfig.json
```

## How AI is used

The AI layer is intentionally designed to look like a practical leadership assist, not just a chatbot gimmick. It provides:

- summary-level recommendations
- risk analysis for operations and delivery
- roadmap suggestions grounded in business context
- leadership-friendly guidance instead of raw technical output

The app supports an optional real AI provider behind the API route. If `AI_API_KEY` is configured, the app will call an external AI service for generated insights. If it is not configured, the app gracefully falls back to the built-in local heuristic logic so the project still works without a vendor account.

## AI provider setup

Create a local `.env.local` file inside the frontend app from the example and add your own free-tier or trial API key:

```bash
cd frontend
cp .env.example .env.local
```

Then set values such as:

```bash
AI_API_KEY=your_provider_key
AI_MODEL=openrouter/auto
AI_BASE_URL=https://openrouter.ai/api/v1
```

This keeps the project portable while allowing real AI output when an API key is available.

## Private RAG chatbot

The private chatbot keeps the heavy retrieval and orchestration logic in the Java backend so the frontend remains a thin client. The backend now includes:

- document ingestion and chunking for private knowledge repositories
- session-based chat history persistence for private conversations
- a retrieval layer that scores relevant chunks against the user's question
- a backend API for creating sessions and sending a message

Example API usage:

```bash
curl -X POST http://localhost:8080/api/chat/sessions \
  -H 'Content-Type: application/json' \
  -d '{"title":"Project onboarding","userId":"alice"}'

curl -X POST http://localhost:8080/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"<session-id>","userId":"alice","message":"What are our escalation steps?"}'
```

The current implementation uses a provider-agnostic retrieval pattern that is ready for future vector database or embedding-provider integration without changing the API contracts.

## Run locally

### Backend + PostgreSQL

This project includes a convenience script that starts the PostgreSQL container and launches the Spring Boot backend in one command.

```bash
chmod +x start-local.sh
./start-local.sh
```

The script will:

- start the Docker PostgreSQL container from `backend/docker-compose.yml`
- detect the local JDK and Maven installation automatically
- run the backend with:

```bash
cd backend
mvn spring-boot:run
```

If the script finds Java or Maven missing, set them manually first:

```bash
export JAVA_HOME=/path/to/your/jdk
export PATH="$JAVA_HOME/bin:$PATH"
export PATH="/path/to/maven/bin:$PATH"
```

Then run:

```bash
cd backend
mvn spring-boot:run
```

The backend expects PostgreSQL on `localhost:5432` with these local development credentials:

- database: `signalops_ai`
- username: `signalops`
- password: `signalops`

### AI agent configuration for the backend

The backend now decides whether to use the external AI agent or the local heuristic based on the UI selection.

The preferred configuration is stored in PostgreSQL instead of only in the shell. A table called `app_settings` is created automatically by Hibernate, and you can insert the provider values directly into it.

Seed script:

```bash
docker exec -i signalops-ai-postgres psql -U signalops -d signalops_ai < backend/scripts/seed_app_settings.sql
```

Before running the script, edit `backend/scripts/seed_app_settings.sql` and replace the placeholder key with your real provider key.

Example SQL:

```sql
INSERT INTO app_settings (setting_key, setting_value, updated_at)
VALUES
  ('AI_API_KEY', 'your_provider_key', NOW()),
  ('AI_MODEL', 'openrouter/auto', NOW()),
  ('AI_BASE_URL', 'https://openrouter.ai/api/v1', NOW())
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value,
    updated_at = NOW();
```

If no DB value exists, the backend falls back to shell-level environment variables for backward compatibility.

```bash
export AI_API_KEY=your_provider_key
export AI_MODEL=openrouter/auto
export AI_BASE_URL=https://openrouter.ai/api/v1
```

If both are missing, it automatically falls back to the built-in local heuristic logic.

### Stop services

Use this to stop both the backend and the PostgreSQL container:

```bash
chmod +x stop-local.sh
./stop-local.sh
```

The script will:

- stop any running Spring Boot backend process
- stop the Docker Compose PostgreSQL container
- kill any leftover local PostgreSQL process still listening on port 5432

### Frontend

The frontend now calls the backend API at `http://localhost:8080` by default. If needed, you can override it with:

```bash
export NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

Then run:

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000

## Demo user journey

1. Open the landing page to understand the portfolio narrative.
2. Navigate to the dashboard.
3. Change the scenario prompt.
4. Generate AI-driven insights for delivery, reliability, and leadership prioritization.

## Interview talking points

- I built a full-stack product rather than a simple UI mock.
- I used AI to support decision quality, not to eliminate accountability.
- I designed the solution around leadership needs: prioritization, health, and operational clarity.
- I created an application that is easy to explain and easy to expand with real APIs, databases, or orchestration later.

## Git-ready next steps

Before pushing to GitHub, you can:

```bash
git init
# if not already initialized
# add your remote
# git remote add origin <your-repo-url>
# git add .
# git commit -m "Initial AI portfolio project"
# git push -u origin main
```

## Suggested expansion ideas

If you want to make this even stronger for future interviews, consider adding:

- authentication and user roles
- real LLM integration with OpenAI or Azure OpenAI
- PostgreSQL persistence for historical metrics
- dashboards for incidents, release risk, and team load
- CI/CD workflow and deployment pipeline setup

This is intentionally set up as a strong “tech lead” narrative project that can evolve with your experience.
