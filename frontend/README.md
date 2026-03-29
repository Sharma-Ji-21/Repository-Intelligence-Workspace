# Frontend - Repository Analytics Dashboard

Angular client application for repository monitoring, analytics visualization, and contributor exploration.

## 1. Technology Stack

- Angular 20
- TypeScript
- RxJS
- Chart.js
- Angular Router
- Angular HttpClient
- Angular FormsModule

## 2. Frontend Responsibilities

The frontend is responsible for:

1. Collecting repository URLs from users.
2. Triggering repository tracking via backend API.
3. Displaying repository portfolio data in cards and summary widgets.
4. Rendering analytics charts from backend insight payloads.
5. Showing repository-level details and contributors.
6. Presenting score explanation and metric snapshots in a readable way.

## 3. Routing

- `/dashboard`
  - Main workspace page with portfolio overview, repository cards, and scatter chart.
- `/repository/:id`
  - Repository-specific analytics page with metric snapshot, bar chart, and contributors.
- `/`
  - Redirects to `/dashboard`.
- `**`
  - Redirects to `/dashboard`.

## 4. API Integration

Current API base URL in service:

```text
http://localhost:5050/api
```

API methods used by UI:

- `GET /repos`
- `POST /repos`
- `GET /repos/:id`
- `GET /repos/:id/insights`
- `GET /repos/:id/contributors`

The frontend expects the backend worker to produce insights asynchronously.

## 5. Main User Experience

### Dashboard page

- Shows high-level portfolio stats.
- Contains repository intake form.
- Renders scatter chart (`activityScore` vs `complexityScore`) for all repos with insight data.
- Displays repository cards for navigation to detailed analytics.

### Repository analytics page

- Shows repository metadata and GitHub link.
- Shows repository metrics panel with five key metrics:
  - Stars
  - Forks
  - Open issues
  - Recent commits
  - Pull requests
- Renders per-repository bar chart (activity vs complexity).
- Displays difficulty level and contributor count.
- Provides contributor leaderboard with expandable list behavior.
- Includes collapsible score explanation section.

## 6. Project Structure

```text
frontend/
├── src/
│   ├── index.html
│   ├── main.ts
│   ├── styles.css
│   └── app/
│       ├── app.module.ts
│       ├── app-routing-module.ts
│       ├── app.component.*
│       ├── components/
│       │   ├── add-repository/
│       │   ├── repo-card/
│       │   ├── repository-list/
│       │   └── contributor-card/
│       ├── pages/
│       │   ├── dashboard/
│       │   └── repository-analytics/
│       ├── services/
│       │   └── repo.service.ts
│       └── models/
│           └── repo.model.ts
├── angular.json
├── package.json
└── README.md
```

## 7. Data Contracts (Frontend Models)

The repo model includes:

- identity and metadata fields (`id`, `full_name`, `owner`, `repo_url`)
- engagement metrics (`stars`, `forks`, `open_issues`, `contributors_count`)
- extended metrics (`recent_commits`, `pull_requests`, `language_count`, `dependency_count`)
- timestamps (`created_at`, `updated_at`, `last_synced_at`)

Insight model includes:

- `activityScore`
- `complexityScore`
- `difficultyLevel`

## 8. Install and Run

```bash
npm install
npm start
```

Development server:

```text
http://localhost:4200
```

## 9. Scripts

- `npm start`
  - Runs `ng serve`
- `npm run build`
  - Production build
- `npm run watch`
  - Build in watch mode for development
- `npm test`
  - Karma/Jasmine tests

## 10. Rendering and State Notes

- Dashboard and analytics pages use RxJS + HttpClient subscriptions to load data.
- Charts are rendered only after relevant DOM canvas elements exist.
- Insight and contributor fetches use fallback handling in several places to avoid hard page failure when insight is not available yet.
- Contributor list is initially bounded for readability, with user-initiated expansion.

## 11. Score Explanation UI

The analytics page includes a collapsible section:

- Label: "Show how it's calculated"
- Content includes:
  - Activity formula
  - Complexity formula
  - Plain-language interpretation notes

This section is static explanatory UI and does not alter backend values.

## 12. Troubleshooting

- Blank repository list:
  - Ensure backend API is running on expected host/port.
- Insights missing:
  - Worker may still be processing; refresh after job completion.
- CORS/network errors:
  - Verify backend CORS middleware is active and API base URL is correct.
- Charts not visible:
  - Confirm insight data exists and browser console has no Chart.js errors.

## 13. Developer Notes

- Keep UI changes consistent with existing design tokens (`var(--...)`).
- Avoid introducing breaking contract changes in frontend models unless backend is updated in the same release.
- Prefer incremental updates to dashboard cards and analytics sections to preserve layout stability.
