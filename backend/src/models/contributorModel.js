import { query } from '../config/db.js';

const createContributors = async (repoId, contributors) => {
    if (!Array.isArray(contributors) || contributors.length === 0) {
        return [];
    }

    const values = [];
    const placeholders = contributors.map((contributor, index) => {
        const offset = index * 5;

        values.push(
            repoId,
            contributor.username,
            contributor.profile_url ?? null,
            contributor.avatar_url ?? null,
            contributor.contributions ?? 0
        );

        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
    });

    const text = `
        INSERT INTO repository_contributors (repo_id, username, profile_url, avatar_url, contributions)
        VALUES ${placeholders.join(', ')}
        RETURNING *
    `;

    const result = await query(text, values);
    return result.rows;
};

const deleteContributorsByRepoId = async (repoId) => {
    const text = 'DELETE FROM repository_contributors WHERE repo_id = $1';
    await query(text, [repoId]);
};

const getContributorsByRepoId = async (repoId) => {
    const text = `
        SELECT *
        FROM repository_contributors
        WHERE repo_id = $1
        ORDER BY contributions DESC
    `;

    const result = await query(text, [repoId]);
    return result.rows;
};

export {
    createContributors,
    deleteContributorsByRepoId,
    getContributorsByRepoId
};
