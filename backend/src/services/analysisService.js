const toNumber = (value) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
};

const calculateActivityScore = (repo) => {
    const stars = toNumber(repo?.stars);
    const forks = toNumber(repo?.forks);
    const watchers = toNumber(repo?.watchers);
    const openIssues = toNumber(repo?.open_issues);

    const activity =
        stars * 0.2 +
        forks * 0.2 +
        watchers * 0.2 +
        openIssues * 0.1;

    const normalized = Math.min(100, activity / 100);
    const activityScore = Math.max(0, Math.min(100, Math.round(normalized * 100)));

    return {
        activityScore
    };
};

const calculateComplexityScore = (repo) => {
    const stars = toNumber(repo?.stars);
    const forks = toNumber(repo?.forks);
    const openIssues = toNumber(repo?.open_issues);

    const complexity =
        forks * 0.3 +
        openIssues * 0.2 +
        stars * 0.1;

    const normalized = Math.min(100, complexity / 100);
    const complexityScore = Math.max(0, Math.min(100, Math.round(normalized * 100)));

    return {
        complexityScore
    };
};

const classifyDifficulty = (complexityScore) => {
    const score = toNumber(complexityScore);

    if (score <= 30) {
        return { difficultyLevel: 'Beginner' };
    }

    if (score <= 70) {
        return { difficultyLevel: 'Intermediate' };
    }

    return { difficultyLevel: 'Advanced' };
};

export { calculateActivityScore, calculateComplexityScore, classifyDifficulty };
