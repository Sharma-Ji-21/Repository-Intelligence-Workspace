const toNumber = (value) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
};

const MAX_ACTIVITY = 100;
const MAX_COMPLEXITY = 20;

const calculateActivityScore = (repo) => {
    const recentCommits = toNumber(repo?.recent_commits);
    const pullRequests = toNumber(repo?.pull_requests);
    const issues = toNumber(repo?.issues ?? repo?.open_issues);
    const contributors = toNumber(repo?.contributors ?? repo?.contributors_count);

    const activity =
        recentCommits * 0.4 +
        pullRequests * 0.3 +
        issues * 0.2 +
        contributors * 0.1;

    const activityScore = Math.max(
        0,
        Math.min(100, Math.round((activity / MAX_ACTIVITY) * 100))
    );

    return {
        activityScore
    };
};

const calculateComplexityScore = (repo) => {
    const languageCount = toNumber(repo?.language_count);
    const dependencyCount = toNumber(repo?.dependency_count);
    const repoSizeKB = toNumber(repo?.repo_size_kb);
    const topics = toNumber(repo?.topics);

    const complexity =
        languageCount * 0.4 +
        dependencyCount * 0.3 +
        (repoSizeKB / 10000) * 0.2 +
        topics * 0.1;

    const complexityScore = Math.max(
        0,
        Math.min(100, Math.round((complexity / MAX_COMPLEXITY) * 100))
    );

    return {
        complexityScore
    };
};

const classifyDifficulty = (activityScore, complexityScore) => {
    const activity = toNumber(activityScore);
    const complexity = toNumber(complexityScore);

    const combined = activity * 0.4 + complexity * 0.6;

    if (combined > 65) {
        return { difficultyLevel: 'Advanced' };
    }

    if (combined > 35) {
        return { difficultyLevel: 'Intermediate' };
    }

    return { difficultyLevel: 'Beginner' };
};

export { calculateActivityScore, calculateComplexityScore, classifyDifficulty };
