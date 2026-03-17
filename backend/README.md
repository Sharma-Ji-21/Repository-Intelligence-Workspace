# Backend - GitHub Repository Analyzer API

Express + PostgreSQL + Redis backend for repository ingestion, analytics, contributors sync, and background processing.

## Tech Stack

- Node.js (ES Modules)
- Express 4
- PostgreSQL (`pg`)
- Redis (`ioredis`)
- BullMQ (queue + worker)
- Cron scheduling (`node-cron`)

## What This Service Does

1. Accepts a GitHub repository URL.
2. Fetches repository metadata from GitHub API.
3. Persists repository data in PostgreSQL.
4. Queues async analysis jobs via BullMQ.
5. Worker updates repo stats, contributors, and insights.
6. Cron job re-queues all tracked repositories every hour.
7. Caches read-heavy API responses in Redis (120s TTL).

## Folder Structure

```text
backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   ├── controllers/
│   │   ├── repoController.js
│   │   └── webhookController.js
│   ├── jobs/
│   │   └── repositorySyncJob.js
│   ├── middlewares/
│   │   ├── errorHandler.js
│   │   └── validateRepoUrl.js
│   ├── models/
│   │   ├── schema.sql
│   │   ├── insightsSchema.sql
│   │   ├── contributorsSchema.sql
│   │   ├── repoModel.js
│   │   ├── insightModel.js
│   │   └── contributorModel.js
│   ├── queues/
│   │   └── repoQueue.js
│   ├── routes/
│   │   ├── healthRoutes.js
│   │   ├── repoRoutes.js
│   │   └── webhookRoutes.js
│   ├── services/
│   │   ├── githubService.js
│   │   ├── repoService.js
│   │   └── analysisService.js
│   ├── utils/
│   │   ├── cache.js
│   │   └── parseRepoUrl.js
│   └── workers/
│       └── repoWorker.js
├── .env.example
├── package.json
└── README.md
```

## Environment Variables

Copy the template and fill values:

```bash
cp .env.example .env
```

Required variables:

- `PORT` (default: `5050`)
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `REDIS_HOST` (default: `localhost`)
- `REDIS_PORT` (default: `6379`)
- `GITHUB_TOKEN` (recommended to avoid GitHub API rate limits)

Do not commit real secrets in `.env`.

## Database Setup

Create database (example):

```bash
createdb github_repo_analyzer
```

Run schema files:

```bash
psql -U <db_user> -d <db_name> -f src/models/schema.sql
psql -U <db_user> -d <db_name> -f src/models/insightsSchema.sql
psql -U <db_user> -d <db_name> -f src/models/contributorsSchema.sql
```

## Install and Run

```bash
npm install
```

Start API server:

```bash
npm run dev
```

Start worker (separate terminal):

```bash
npm run worker
```

Production server:

```bash
npm start
```

## API Endpoints

Base URL: `http://localhost:5050`

### Health

- `GET /health`

Response:

```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Repository APIs

- `POST /api/repos`
  - Body:
    ```json
    {
      "repoUrl": "https://github.com/{owner}/{repo}"
    }
    ```
  - Validates URL, saves repo if new, queues analysis job.

- `GET /api/repos`
  - Returns all tracked repositories (cached).

- `GET /api/repos/:id`
  - Returns repository detail by internal DB id (cached).

- `GET /api/repos/:id/insights`
  - Returns latest analytics snapshot for repository (cached):
    - `activityScore`
    - `complexityScore`
    - `difficultyLevel`

- `GET /api/repos/:id/contributors`
  - Returns contributors ordered by contributions desc (cached).

### Webhook

- `POST /api/webhooks/github`
  - Listens for GitHub `push` event.
  - If repository is tracked, queues re-analysis job.
  - Non-`push` events are ignored with `200` response.

## Background Processing

- Queue name: `repository-analysis`
- Job name: `analyze-repository`
- Worker steps:
  1. Load repository by id.
  2. Fetch latest repo metadata from GitHub.
  3. Update stats in DB.
  4. Fetch contributors and update contributor table/count.
  5. Compute insight scores and difficulty.
  6. Save insight snapshot.
  7. Invalidate related Redis keys.

## Scoring Logic

- Activity score uses stars, forks, watchers, open issues.
- Complexity score uses forks, open issues, stars.
- Difficulty buckets:
  - `0-30`: Beginner
  - `31-70`: Intermediate
  - `71-100`: Advanced

## Caching Strategy

Redis keys used:

- `repos:list`
- `repo:{id}`
- `repo:{id}:insights`
- `repo:{id}:contributors`

Default TTL is 120 seconds. Relevant keys are deleted when data changes.

## Error Handling Notes

- Unknown routes return 404 JSON (`Route not found`).
- Validation errors return 400 JSON.
- GitHub API errors surface clear messages for 404 and rate-limit cases.

## Quick Smoke Test

```bash
curl http://localhost:5050/health

curl -X POST http://localhost:5050/api/repos \
  -H "Content-Type: application/json" \
  -d '{"repoUrl":"https://github.com/nodejs/node"}'

curl http://localhost:5050/api/repos
```
