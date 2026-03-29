import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

const githubClient = axios.create({
    baseURL: GITHUB_API_BASE,
    headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
        })
    }
});

const normalizeRepository = (data) => ({
    github_id: data.id,
    name: data.name,
    owner: data.owner.login,
    full_name: data.full_name,
    description: data.description ?? null,
    stars: data.stargazers_count,
    forks: data.forks_count,
    watchers: data.watchers_count,
    language: data.language ?? null,
    open_issues: data.open_issues_count,
    repo_url: data.html_url,
    created_at: data.created_at,
    updated_at: data.updated_at,
    repo_size_kb: data.size,
    topics: Array.isArray(data.topics) ? data.topics.length : 0
});

const normalizeContributors = (data) => data
    .filter((contributor) => contributor.login)
    .slice(0, 10)
    .map((contributor) => ({
        username: contributor.login,
        profile_url: contributor.html_url,
        avatar_url: contributor.avatar_url,
        contributions: contributor.contributions
    }));

const extractContributorsCount = (linkHeader, fallbackCount) => {
    if (!linkHeader) {
        return fallbackCount;
    }

    const lastMatch = linkHeader.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/);

    if (!lastMatch) {
        return fallbackCount;
    }

    const lastPage = Number.parseInt(lastMatch[1], 10);

    if (Number.isNaN(lastPage)) {
        return fallbackCount;
    }

    return lastPage * 10;
};

const extractPullRequestsCount = (linkHeader, fallbackCount) => {
    if (!linkHeader) {
        return fallbackCount;
    }

    const lastMatch = linkHeader.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/);

    if (!lastMatch) {
        return fallbackCount;
    }

    const lastPage = Number.parseInt(lastMatch[1], 10);

    if (Number.isNaN(lastPage)) {
        return fallbackCount;
    }

    return lastPage;
};

const handleGithubApiError = (error, owner, repo) => {
    if (error.response) {
        const { status } = error.response;

        if (status === 404) {
            throw new Error(`Repository '${owner}/${repo}' not found`);
        }

        if (status === 403 || status === 429) {
            const resetAt = error.response.headers['x-ratelimit-reset'];
            const resetTime = resetAt
                ? new Date(resetAt * 1000).toISOString()
                : 'unknown';
            throw new Error(`GitHub API rate limit exceeded. Resets at: ${resetTime}`);
        }

        throw new Error(
            `GitHub API error: ${status} ${error.response.data?.message ?? error.message}`
        );
    }

    throw new Error(`Network error while contacting GitHub API: ${error.message}`);
};

const fetchRepository = async (owner, repo) => {
    try {
        const { data } = await githubClient.get(`/repos/${owner}/${repo}`);
        return normalizeRepository(data);
    } catch (error) {
        handleGithubApiError(error, owner, repo);
    }
};

const fetchRepositoryContributors = async (owner, repo) => {
    try {
        const { data, headers } = await githubClient.get(
            `/repos/${owner}/${repo}/contributors`,
            { params: { per_page: 10, anon: true } }
        );

        const contributors = normalizeContributors(data);
        const contributorsCount = extractContributorsCount(
            headers?.link || null,
            data.length
        );

        return {
            contributors,
            contributorsCount
        };
    } catch (error) {
        if (error?.response?.status === 404) {
            handleGithubApiError(error, owner, repo);
        }
        return {
            contributors: [],
            contributorsCount: 0
        };
    }
};

const fetchRecentCommits = async (owner, repo) => {
    try {
        const since = new Date();
        since.setDate(since.getDate() - 90);

        const { data } = await githubClient.get(
            `/repos/${owner}/${repo}/commits`,
            {
                params: {
                    since: since.toISOString(),
                    per_page: 100
                }
            }
        );

        return Array.isArray(data) ? data.length : 0;
    } catch {
        return 0;
    }
};

const fetchPullRequests = async (owner, repo) => {
    try {
        const { data, headers } = await githubClient.get(
            `/repos/${owner}/${repo}/pulls`,
            {
                params: {
                    state: 'all',
                    per_page: 1
                }
            }
        );

        return extractPullRequestsCount(headers?.link || null, Array.isArray(data) ? data.length : 0);
    } catch {
        return 0;
    }
};

const fetchLanguages = async (owner, repo) => {
    try {
        const { data } = await githubClient.get(`/repos/${owner}/${repo}/languages`);
        return data && typeof data === 'object' ? Object.keys(data).length : 0;
    } catch {
        return 0;
    }
};

const fetchDependencyCount = async (owner, repo) => {
    try {
        const { data } = await githubClient.get(`/repos/${owner}/${repo}/contents/package.json`);

        if (!data?.content) {
            return 0;
        }

        const content = Buffer.from(data.content, 'base64').toString();
        const pkg = JSON.parse(content);

        const dependencies = Object.keys(pkg.dependencies || {});
        const devDependencies = Object.keys(pkg.devDependencies || {});

        return dependencies.length + devDependencies.length;
    } catch {
        return 0;
    }
};

export {
    fetchRepository,
    fetchRepositoryContributors,
    fetchRecentCommits,
    fetchPullRequests,
    fetchLanguages,
    fetchDependencyCount
};
