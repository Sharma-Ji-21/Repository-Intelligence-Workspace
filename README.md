# GitHub Repository Analyzer (Full Stack)

Full-stack repository intelligence platform for ingesting GitHub repositories, computing analytics asynchronously, and visualizing health signals in Angular dashboards.

## 1. What This System Does

This project allows users to submit GitHub repository URLs and track them over time.

Core capabilities:

- Repository onboarding through a frontend form and backend validation pipeline.
- GitHub metadata ingestion (repo info, contributors, commits, pull requests, languages, dependencies).
- Async processing with BullMQ workers for reliable analytics computation.
- Persistent storage in PostgreSQL for repositories, insights, and contributors.
- Redis-backed caching for read-heavy API endpoints.
- Scheduled and webhook-triggered refresh to keep analytics current.

## 2. High-Level Architecture

```text
Angular Frontend (port 4200)
        |
        v
Express API (port 5050)
   |            |
   |            +--> Redis (cache + BullMQ connection)
   |                         |
   |                         v
   |                   BullMQ Worker
   |
   +--> PostgreSQL (repositories, insights, contributors)

GitHub REST API <------ API Service + Worker Service Calls
```

## 3. Repository Layout

```text
C2si-org-Pregsoc/
├── backend/
│   ├── src/
│   │   ├── app.js / server.js
│   │   ├── config/            (DB + Redis config)
│   │   ├── controllers/       (HTTP handlers)
│   │   ├── routes/            (API routes)
│   │   ├── services/          (GitHub + scoring + orchestration)
│   │   ├── models/            (SQL + DB access layer)
│   │   ├── queues/            (BullMQ queue producer)
│   │   ├── workers/           (BullMQ queue consumer)
│   │   ├── jobs/              (hourly sync scheduler)
│   │   ├── middlewares/       (validation + error handling)
│   │   └── utils/             (cache + URL parsing)
│   └── README.md
├── frontend/
│   ├── src/app/
│   │   ├── pages/             (dashboard, repository analytics)
│   │   ├── components/        (repo card, contributor card, add form)
│   │   ├── services/          (API client)
│   │   └── models/            (frontend interfaces)
│   └── README.md
└── README.md
```

## 4. End-to-End Flow

1. User submits a repository URL on the dashboard.
2. Backend validates URL format and parses owner/repo.
3. Backend fetches repository details from GitHub and stores/updates PostgreSQL row.
4. Backend enqueues analysis job (`repository-analysis`).
5. Worker fetches latest GitHub metrics and contributors.
6. Worker updates repository stats, contributor records, and insight snapshot.
7. Worker invalidates Redis cache keys for changed data.
8. Frontend requests repositories, insights, and contributors to render cards and charts.

## 5. Analytics Model

Current scoring model:

- Activity Score:
  - `0.4 * recent_commits + 0.3 * pull_requests + 0.2 * issues + 0.1 * contributors`
- Complexity Score:
  - `0.4 * language_count + 0.3 * dependency_count + 0.2 * (repo_size_kb / 10000) + 0.1 * topics`
- Difficulty level:
  - Based on weighted combination: `0.4 * activity + 0.6 * complexity`
  - Bucketed to Beginner / Intermediate / Advanced

## 6. Prerequisites

- Node.js (LTS)
- npm
- PostgreSQL
- Redis
- Optional but recommended: GitHub token for higher rate limits

## 7. Quick Start (Local)

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Create database and run schema scripts:

```bash
createdb github_repo_analyzer
psql -U <db_user> -d <db_name> -f src/models/schema.sql
psql -U <db_user> -d <db_name> -f src/models/insightsSchema.sql
psql -U <db_user> -d <db_name> -f src/models/contributorsSchema.sql
```

Start backend API and worker in separate terminals:

```bash
npm run dev
npm run worker
```

### Frontend

```bash
cd frontend
npm install
npm start
```

App URLs:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:5050`

## 8. API Surface

- `GET /health`
- `POST /api/repos`
- `GET /api/repos`
- `GET /api/repos/:id`
- `GET /api/repos/:id/insights`
- `GET /api/repos/:id/contributors`
- `POST /api/webhooks/github`

See backend README for route-level behavior and caching details.

## 9. Operations and Background Processing

- Queue name: `repository-analysis`
- Worker process: pulls queued jobs and computes analytics
- Cron sync: every hour (`0 * * * *`) queues all tracked repositories
- Cache keys invalidated on write-path updates:
  - `repos:list`
  - `repo:{id}`
  - `repo:{id}:insights`
  - `repo:{id}:contributors`

## 10. Common Development Workflow

1. Start DB and Redis.
2. Start backend API.
3. Start worker.
4. Start frontend.
5. Add repo from dashboard.
6. Validate queue + worker logs.
7. Validate insights and contributors appear in UI.

## 11. Troubleshooting

- Backend startup fails:
  - Check DB env vars and DB reachability.
- Redis connection issues:
  - Check host/port/credentials and service status.
- Insights not appearing:
  - Verify worker is running and queue jobs are processing.
- GitHub rate-limit responses:
  - Configure `GITHUB_TOKEN`.
- Contributor/dependency metrics are zero:
  - Repository may not expose those resources, or file/language ecosystem may differ.

## 12. Security and Reliability Notes

- Do not commit real secrets.
- Keep `.env` local and use templates for safe defaults.
- Consider adding webhook signature verification for production exposure.
- Caching is intentionally short-lived (120s) to balance freshness and performance.

## 13. Documentation Map

- Backend implementation and API details: `backend/README.md`
- Frontend architecture and UI behavior: `frontend/README.md`
