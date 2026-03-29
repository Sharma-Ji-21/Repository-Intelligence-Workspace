# Backend - GitHub Repository Analyzer API

Production-style Node.js backend responsible for repository ingestion, async analytics computation, caching, and data delivery to the frontend.

## 1. Technology Stack

- Runtime: Node.js (ES modules)
- API framework: Express 4
- Database: PostgreSQL (`pg`)
- Cache + queue connection: Redis (`ioredis`)
- Queueing: BullMQ
- Scheduler: node-cron
- Logging middleware: morgan

## 2. Responsibilities

This backend handles:

1. Repository URL intake and validation.
2. GitHub API communication for repository and activity data.
3. PostgreSQL persistence for repositories, insights, and contributors.
4. Queueing analysis jobs for asynchronous processing.
5. Worker-driven scoring and contributor synchronization.
6. Redis caching of read endpoints.
7. Scheduled and webhook-triggered re-analysis.

## 3. Source Layout

```text
backend/
├── src/
│   ├── app.js                    # Express app wiring
│   ├── server.js                 # startup, health checks, cron init
│   ├── config/
│   │   ├── db.js                 # pg pool + connection test
│   │   └── redis.js              # ioredis client + connection test
│   ├── controllers/
│   │   ├── repoController.js     # /api/repos handlers
│   │   └── webhookController.js  # /api/webhooks/github handler
│   ├── jobs/
│   │   └── repositorySyncJob.js  # hourly full requeue
│   ├── middlewares/
│   │   ├── validateRepoUrl.js
│   │   └── errorHandler.js
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

## 4. Environment Variables

Create env file:

```bash
cp .env.example .env
```

Required/expected keys:

- `PORT` (default `5050`)
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `REDIS_HOST` (default `localhost`)
- `REDIS_PORT` (default `6379`)
- `REDIS_USER` (optional)
- `REDIS_PASSWORD` (optional)
- `GITHUB_TOKEN` (recommended)

## 5. Local Setup

Install dependencies:

```bash
npm install
```

Initialize database:

```bash
createdb github_repo_analyzer
psql -U <db_user> -d <db_name> -f src/models/schema.sql
psql -U <db_user> -d <db_name> -f src/models/insightsSchema.sql
psql -U <db_user> -d <db_name> -f src/models/contributorsSchema.sql
```

Start API server:

```bash
npm run dev
```

Start worker (second terminal):

```bash
npm run worker
```

Production-style startup:

```bash
npm start
```

## 6. Runtime Startup Sequence

On startup the server:

1. Validates and tests PostgreSQL connection.
2. Validates and tests Redis connection.
3. Starts Express HTTP listener.
4. Starts hourly repository sync cron job.
5. Worker process (separate command) listens to BullMQ queue.

## 7. HTTP API

Base URL:

```text
http://localhost:5050
```

### Health

- `GET /health`

Response shape:

```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Repository Endpoints

- `POST /api/repos`
  - Validates `repoUrl` format.
  - Parses owner/repo.
  - Fetches and stores repo metadata.
  - Enqueues analysis job.

- `GET /api/repos`
  - Returns all repositories, cached under `repos:list`.

- `GET /api/repos/:id`
  - Returns repository row by internal id, cached under `repo:{id}`.

- `GET /api/repos/:id/insights`
  - Returns latest insight payload for repository, cached under `repo:{id}:insights`.

- `GET /api/repos/:id/contributors`
  - Returns contributors sorted by contributions desc, cached under `repo:{id}:contributors`.

### Webhook Endpoint

- `POST /api/webhooks/github`
  - Accepts GitHub events.
  - Processes only `push` events.
  - If repository is tracked, enqueues re-analysis.

## 8. Queue and Worker Lifecycle

Queue:

- Queue name: `repository-analysis`
- Job name: `analyze-repository`
- Payload: `{ repoId }`

Worker processing steps:

1. Load repository by id from PostgreSQL.
2. Fetch in parallel from GitHub:
   - repository metadata
   - contributors
   - recent commits
   - pull requests
   - language count
   - dependency count
3. Update repository stats.
4. Update contributor count and contributor list.
5. Calculate activity score, complexity score, and difficulty level.
6. Insert insight snapshot.
7. Invalidate cache keys impacted by updated data.

## 9. Data Model Summary

### repositories

Key columns include:

- core: `id`, `github_id`, `owner`, `name`, `full_name`
- engagement: `stars`, `forks`, `open_issues`, `contributors_count`
- extended metrics: `recent_commits`, `pull_requests`, `language_count`, `dependency_count`
- context: `repo_url`, `description`, `language`, `created_at`, `updated_at`, `last_synced_at`

### repository_insights

- `repo_id`, `activity_score`, `complexity_score`, `difficulty_level`, `created_at`

### repository_contributors

- `repo_id`, `username`, `profile_url`, `avatar_url`, `contributions`

## 10. Scoring System - Assumptions & Limitations

### Formulas

- Activity score:
  - `0.4 * recent_commits + 0.3 * pull_requests + 0.2 * issues + 0.1 * contributors`
- Complexity score:
  - `0.4 * language_count + 0.3 * dependency_count + 0.2 * (repo_size_kb / 10000) + 0.1 * topics`
- Difficulty:
  - Combined score = `0.4 * activity + 0.6 * complexity`
  - Bucketed to Beginner / Intermediate / Advanced

### Practical assumptions

- Issue and contributor values support fallback field names to avoid scoring breakage.
- Missing metric data is normalized to `0`.
- Scores are normalized into a 0-100 range before persistence.

### Limitations

- Commits and pull requests are derived from bounded API pages, not full historical totals.
- Dependency count is based on `package.json` discovery and may be `0` for non-Node repositories.
- Scores are directional indicators, not absolute repository quality guarantees.

## 11. Caching Strategy

Redis cache utility stores JSON values with TTL.

Primary keys:

- `repos:list`
- `repo:{id}`
- `repo:{id}:insights`
- `repo:{id}:contributors`

TTL: 120 seconds by default.

Invalidation occurs when repository stats, insights, or contributor records are updated.

## 12. Scheduler Behavior

Cron schedule:

- `0 * * * *` (top of every hour)

Action:

- Reads all tracked repository ids and enqueues one analysis job per repository.

## 13. Error Handling

- URL validation failures return 400.
- Missing repository/insight records return 404 where applicable.
- Standardized middleware handles uncaught route errors.
- GitHub service returns informative errors for 404 and rate-limits on primary repository fetch.
- Auxiliary metric endpoints fail gracefully and default to zero values where needed.

## 14. Smoke Tests

```bash
curl http://localhost:5050/health

curl -X POST http://localhost:5050/api/repos \
  -H "Content-Type: application/json" \
  -d '{"repoUrl":"https://github.com/nodejs/node"}'

curl http://localhost:5050/api/repos

curl http://localhost:5050/api/repos/1

curl http://localhost:5050/api/repos/1/insights

curl http://localhost:5050/api/repos/1/contributors
```

## 15. Security and Production Notes

- Keep secrets only in environment variables.
- Use a GitHub token to reduce rate-limit impact.
- Add webhook signature verification before exposing webhook endpoint publicly.
- Monitor worker process health separately from API process.
