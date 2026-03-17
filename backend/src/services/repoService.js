import { fetchRepository } from './githubService.js';
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
    const saved = await createRepository(repoData);
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
