# GitHub Repository Analyzer (Full Stack)

A full-stack application that tracks GitHub repositories, computes repository insights, and visualizes analytics in a modern dashboard.

## Overview

This project contains:

- `backend/`: Express API with PostgreSQL + Redis + BullMQ worker.
- `frontend/`: Angular dashboard with charts and analytics pages.

Core workflow:

1. User submits a GitHub repository URL in the frontend.
2. Backend validates URL, fetches repository details from GitHub, and stores data in PostgreSQL.
3. Backend queues an analysis job in Redis/BullMQ.
4. Worker computes activity/complexity/difficulty and syncs contributors.
5. Frontend displays repository portfolio, charts, and contributor leaderboard.

## Architecture

```text
Angular Frontend (4200)
        |
        v
Express API (5050) ----> PostgreSQL (repositories, insights, contributors)
        |
        +----> Redis (cache + BullMQ queue)
                        |
                        v
                 BullMQ Worker (analysis + sync)

GitHub API <-------------------------------- API/Worker
```

## Repository Structure

```text
C2si-org-Pregsoc/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── workers/
│   │   ├── queues/
│   │   ├── jobs/
│   │   └── ...
│   └── README.md
├── frontend/
│   ├── src/app/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── models/
│   └── README.md
└── README.md
```

## Prerequisites

- Node.js (LTS recommended)
- npm
- PostgreSQL
- Redis
- GitHub Personal Access Token (recommended)

## Backend Setup

From project root:

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` with your local PostgreSQL, Redis, and GitHub token values.

Create database (example):

```bash
createdb github_repo_analyzer
```

Apply schemas:

```bash
psql -U <db_user> -d <db_name> -f src/models/schema.sql
psql -U <db_user> -d <db_name> -f src/models/insightsSchema.sql
psql -U <db_user> -d <db_name> -f src/models/contributorsSchema.sql
```

Run backend server and worker in separate terminals:

```bash
npm run dev
npm run worker
```

Backend base URL: `http://localhost:5050`

## Frontend Setup

From project root:

```bash
cd frontend
npm install
npm start
```

Frontend URL: `http://localhost:4200`

## API Summary

- `GET /health`
- `POST /api/repos`
- `GET /api/repos`
- `GET /api/repos/:id`
- `GET /api/repos/:id/insights`
- `GET /api/repos/:id/contributors`
- `POST /api/webhooks/github`

Detailed request/response notes are in [backend/README.md](backend/README.md).

## Frontend Pages

- `/dashboard`
  - Add repository
  - Portfolio cards
  - Scatter chart (activity vs complexity)
  - Repository grid
- `/repository/:id`
  - Repository snapshot
  - Insight bar chart
  - Contributor leaderboard

Detailed UI/component mapping is in [frontend/README.md](frontend/README.md).

## Background Jobs and Sync

- Queue: `repository-analysis`
- Worker updates:
  - latest repo stats
  - contributor list and count
  - repository insight snapshot
- Cron job runs hourly and re-queues all tracked repositories.

## Local Development Order

1. Start PostgreSQL.
2. Start Redis.
3. Start backend API (`npm run dev`).
4. Start backend worker (`npm run worker`).
5. Start frontend (`npm start`).
6. Add a repository from dashboard and verify charts/contributors populate.

## Troubleshooting

- `Database connection failed`: verify DB host/port/user/password/name.
- `Redis connection failed`: verify Redis host/port and Redis service is running.
- GitHub rate-limit errors: set `GITHUB_TOKEN` in backend `.env`.
- No insights shown initially: wait for worker job completion.

## Security Notes

- Never commit real secrets in `.env`.
- Use `.env.example` as the safe template.
- Use webhook signature verification for production hardening (if exposing webhook endpoint publicly).
