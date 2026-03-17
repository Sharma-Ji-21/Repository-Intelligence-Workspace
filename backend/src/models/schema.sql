CREATE TABLE IF NOT EXISTS repositories (
    id               SERIAL PRIMARY KEY,
    github_id        BIGINT UNIQUE NOT NULL,
    name             TEXT NOT NULL,
    owner            TEXT NOT NULL,
    full_name        TEXT UNIQUE NOT NULL,
    description      TEXT,
    stars            INTEGER,
    forks            INTEGER,
    watchers         INTEGER,
    language         TEXT,
    open_issues      INTEGER,
    contributors_count INTEGER DEFAULT 0,
    repo_url         TEXT,
    created_at       TIMESTAMP,
    updated_at       TIMESTAMP,
    last_synced_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_repositories_github_id  ON repositories (github_id);
CREATE INDEX IF NOT EXISTS idx_repositories_full_name  ON repositories (full_name);

ALTER TABLE repositories
ADD COLUMN IF NOT EXISTS contributors_count INTEGER DEFAULT 0;
