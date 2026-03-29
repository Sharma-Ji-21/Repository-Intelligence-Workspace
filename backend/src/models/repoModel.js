import { query } from '../config/db.js';

const toSafeInteger = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
};

const createRepository = async (repoData) => {
    const {
        github_id,
        name,
        owner,
        full_name,
        description,
        stars,
        forks,
        watchers,
        language,
        open_issues,
        contributors_count,
        recent_commits,
        pull_requests,
        language_count,
        dependency_count,
        repo_url,
        created_at,
        updated_at
    } = repoData;

    const text = `
        INSERT INTO repositories
            (github_id, name, owner, full_name, description, stars, forks,
             watchers, language, open_issues, contributors_count, recent_commits, pull_requests,
             language_count, dependency_count, repo_url, created_at, updated_at)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (github_id) DO UPDATE SET
            name           = EXCLUDED.name,
            owner          = EXCLUDED.owner,
            full_name      = EXCLUDED.full_name,
            description    = EXCLUDED.description,
            stars          = EXCLUDED.stars,
            forks          = EXCLUDED.forks,
            watchers       = EXCLUDED.watchers,
            language       = EXCLUDED.language,
            open_issues    = EXCLUDED.open_issues,
            contributors_count = EXCLUDED.contributors_count,
            recent_commits = EXCLUDED.recent_commits,
            pull_requests  = EXCLUDED.pull_requests,
            language_count = EXCLUDED.language_count,
            dependency_count = EXCLUDED.dependency_count,
            repo_url       = EXCLUDED.repo_url,
            created_at     = EXCLUDED.created_at,
            updated_at     = EXCLUDED.updated_at,
            last_synced_at = CURRENT_TIMESTAMP
        RETURNING *
    `;

    const params = [
        github_id, name, owner, full_name, description,
        toSafeInteger(stars), toSafeInteger(forks), toSafeInteger(watchers), language,
        toSafeInteger(open_issues), toSafeInteger(contributors_count),
        toSafeInteger(recent_commits), toSafeInteger(pull_requests),
        toSafeInteger(language_count), toSafeInteger(dependency_count),
        repo_url, created_at, updated_at
    ];

    const result = await query(text, params);
    return result.rows[0];
};

const getRepositoryById = async (id) => {
    const text = 'SELECT * FROM repositories WHERE id = $1';
    const result = await query(text, [id]);
    return result.rows[0] ?? null;
};

const getRepositoryByFullName = async (fullName) => {
    const text = 'SELECT * FROM repositories WHERE full_name = $1';
    const result = await query(text, [fullName]);
    return result.rows[0] ?? null;
};

const getAllRepositories = async () => {
    const text = 'SELECT * FROM repositories ORDER BY last_synced_at DESC';
    const result = await query(text);
    return result.rows;
};

const updateRepositoryStats = async (id, repoData) => {
    const {
        stars,
        forks,
        watchers,
        open_issues,
        recent_commits,
        pull_requests,
        language_count,
        dependency_count,
        description,
        language,
        updated_at
    } = repoData;

    const text = `
        UPDATE repositories
        SET
            stars          = $1,
            forks          = $2,
            watchers       = $3,
            open_issues    = $4,
            recent_commits = $5,
            pull_requests  = $6,
            language_count = $7,
            dependency_count = $8,
            description    = $9,
            language       = $10,
            updated_at     = $11,
            last_synced_at = CURRENT_TIMESTAMP
        WHERE id = $12
        RETURNING *
    `;

    const params = [
        toSafeInteger(stars),
        toSafeInteger(forks),
        toSafeInteger(watchers),
        toSafeInteger(open_issues),
        toSafeInteger(recent_commits),
        toSafeInteger(pull_requests),
        toSafeInteger(language_count),
        toSafeInteger(dependency_count),
        description,
        language,
        updated_at,
        id
    ];
    const result = await query(text, params);
    return result.rows[0] ?? null;
};

const updateContributorCount = async (repoId, count) => {
    const text = `
        UPDATE repositories
        SET contributors_count = $2
        WHERE id = $1
    `;

    await query(text, [repoId, count]);
};

export {
    createRepository,
    getRepositoryById,
    getRepositoryByFullName,
    getAllRepositories,
    updateRepositoryStats,
    updateContributorCount
};
