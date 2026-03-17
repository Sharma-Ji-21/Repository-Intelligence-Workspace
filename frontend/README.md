# Frontend - Repository Analytics Dashboard

Angular application for tracking GitHub repositories, viewing analytics insights, and browsing contributor activity.

## Tech Stack

- Angular 20
- TypeScript
- RxJS
- Chart.js
- Angular Router + HttpClient + FormsModule

## Features

- Dashboard page with:
  - Add repository form (`repoUrl` input)
  - Portfolio summary cards (repos, stars, forks, languages)
  - Scatter chart: activity score vs complexity score
  - Repository card grid with navigation to analytics details
- Repository analytics page with:
  - Repository metadata + GitHub link
  - Bar chart (activity vs complexity)
  - Difficulty level and contributor count
  - Contributor leaderboard (top 10 / full list toggle)

## Routing

- `/dashboard` -> portfolio overview
- `/repository/:id` -> repository analytics details
- `/` -> redirects to `/dashboard`

## API Dependency

Frontend calls backend API at:

```text
http://localhost:5050/api
```

Configured in `src/app/services/repo.service.ts`.

Make sure backend server and worker are running before using the UI.

## Project Structure

```text
frontend/
├── src/
│   ├── main.ts
│   ├── styles.css
│   └── app/
│       ├── app.ts
│       ├── app.html
│       ├── app-module.ts
│       ├── app.module.ts
│       ├── app-routing-module.ts
│       ├── components/
│       │   ├── add-repository/
│       │   ├── repo-card/
│       │   └── contributor-card/
│       ├── pages/
│       │   ├── dashboard/
│       │   └── repository-analytics/
│       ├── models/
│       │   └── repo.model.ts
│       └── services/
│           └── repo.service.ts
├── angular.json
├── package.json
└── README.md
```

## Install and Run

```bash
npm install
npm start
```

Then open:

```text
http://localhost:4200
```

## Available Scripts

- `npm start` -> run development server (`ng serve`)
- `npm run build` -> production build
- `npm run watch` -> dev build watcher
- `npm test` -> unit tests (Karma)

## UI Flow

1. Open dashboard.
2. Add a GitHub repository URL.
3. Backend stores and queues analysis.
4. Dashboard reloads repositories and insights.
5. Open repository card to view detailed analytics and contributors.

## Notes

- If insights are not yet visible, the worker may still be processing queue jobs.
- Charts only render when data is available.
- Contributor list defaults to top 10 for readability.
