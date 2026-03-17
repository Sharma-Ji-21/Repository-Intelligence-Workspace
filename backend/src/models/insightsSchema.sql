CREATE TABLE IF NOT EXISTS repository_insights (
    id                SERIAL PRIMARY KEY,
    repo_id           INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
    activity_score    INTEGER,
    complexity_score  INTEGER,
    difficulty_level  TEXT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_repository_insights_repo_id ON repository_insights (repo_id);
