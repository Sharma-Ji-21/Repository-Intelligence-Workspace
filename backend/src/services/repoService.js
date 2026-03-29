import {
    fetchRepository,
    fetchRepositoryContributors,
    fetchRecentCommits,
    fetchPullRequests,
    fetchLanguages,
    fetchDependencyCount
} from './githubService.js';
import {
    createRepository,
    getAllRepositories as getAllReposFromDb,
    getRepositoryById as getRepoByIdFromDb,
    getRepositoryByFullName
} from '../models/repoModel.js';
import { parseRepoUrl } from '../utils/parseRepoUrl.js';
import { enqueueRepositoryAnalysis } from '../queues/repoQueue.js';

const addRepository = async (repoUrl) => {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const fullName = `${owner}/${repo}`;

    const existing = await getRepositoryByFullName(fullName);

    if (existing) {
        return {
            repository: existing,
            alreadyExists: true
        };
    }

    const repoData = await fetchRepository(owner, repo);

    const [
        contributorsData,
        recentCommits,
        pullRequests,
        languageCount,
        dependencyCount
    ] = await Promise.all([
        fetchRepositoryContributors(owner, repo),
        fetchRecentCommits(owner, repo),
        fetchPullRequests(owner, repo),
        fetchLanguages(owner, repo),
        fetchDependencyCount(owner, repo)
    ]);

    const enrichedRepo = {
        ...repoData,
        contributors_count: contributorsData.contributorsCount,
        recent_commits: recentCommits,
        pull_requests: pullRequests,
        language_count: languageCount,
        dependency_count: dependencyCount
    };

    const saved = await createRepository(enrichedRepo);
    await enqueueRepositoryAnalysis(saved.id);

    console.log(`Repository added: ${saved.full_name}`);

    return {
        repository: saved,
        alreadyExists: false
    };
};

const getAllRepositories = async () => {
    return getAllReposFromDb();
};

const getRepositoryById = async (id) => {
    const repo = await getRepoByIdFromDb(id);

    if (!repo) {
        throw new Error(`Repository with id '${id}' not found`);
    }

    return repo;
};

export { addRepository, getAllRepositories, getRepositoryById };
