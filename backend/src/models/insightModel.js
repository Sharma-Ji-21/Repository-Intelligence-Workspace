import { query } from '../config/db.js';

const createInsight = async (repoId, activityScore, complexityScore, difficultyLevel) => {
    const text = `
        INSERT INTO repository_insights
        (repo_id, activity_score, complexity_score, difficulty_level)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;

    const result = await query(text, [
        repoId,
        activityScore,
        complexityScore,
        difficultyLevel
    ]);

    return result.rows[0];
};

const getInsightByRepoId = async (repoId) => {
    const text = `
        SELECT *
        FROM repository_insights
        WHERE repo_id = $1
        ORDER BY created_at DESC
        LIMIT 1
    `;

    const result = await query(text, [repoId]);
    return result.rows[0] ?? null;
};

export { createInsight, getInsightByRepoId };
