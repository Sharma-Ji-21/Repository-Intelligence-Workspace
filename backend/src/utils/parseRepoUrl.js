const GITHUB_REPO_PATTERN = /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(\.git)?\/?$/;

const parseRepoUrl = (repoUrl) => {
    if (!repoUrl || typeof repoUrl !== 'string') {
        throw new Error('Repository URL must be a non-empty string');
    }

    const match = repoUrl.trim().match(GITHUB_REPO_PATTERN);

    if (!match) {
        throw new Error(
            `Invalid GitHub repository URL: '${repoUrl}'. Expected format: https://github.com/{owner}/{repo}`
        );
    }

    return {
        owner: match[1],
        repo: match[2]
    };
};

export { parseRepoUrl };
