CREATE TABLE IF NOT EXISTS repository_contributors (
    id             SERIAL PRIMARY KEY,
    repo_id        INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
    username       TEXT NOT NULL,
    profile_url    TEXT,
    avatar_url     TEXT,
    contributions  INTEGER
);

ALTER TABLE repository_contributors
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE INDEX IF NOT EXISTS idx_repository_contributors_repo_id
    ON repository_contributors (repo_id);
