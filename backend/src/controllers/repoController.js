import {
    addRepository,
    getAllRepositories,
    getRepositoryById
} from '../services/repoService.js';
import { getRepositoryById as getRepoById } from '../models/repoModel.js';
import { getInsightByRepoId } from '../models/insightModel.js';
import { getContributorsByRepoId } from '../models/contributorModel.js';
import { getCache, setCache, deleteCache } from '../utils/cache.js';

const addRepositoryController = async (req, res, next) => {
    try {
        const cacheKey = 'repos:list';
        await deleteCache(cacheKey);
        const { repoUrl } = req.body;

        const { repository, alreadyExists } = await addRepository(repoUrl);
        return res.status(alreadyExists ? 200 : 201).json(repository);
    } catch (error) {
        return next(error);
    }
};

const getAllRepositoriesController = async (_req, res, next) => {
    try {
        const cacheKey = 'repos:list';

        const cached = await getCache(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        const repositories = await getAllRepositories();
        await setCache(cacheKey, repositories, 120);
        return res.status(200).json(repositories);
    } catch (error) {
        return next(error);
    }
};

const getRepositoryByIdController = async (req, res, next) => {
    try {
        const cacheKey = `repo:${req.params.id}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        const { id } = req.params;
        const repository = await getRepositoryById(id);
        await setCache(cacheKey, repository, 120);
        return res.status(200).json(repository);
    } catch (error) {
        return next(error);
    }
};

const getRepositoryInsightsController = async (req, res, next) => {
    try {
        const cacheKey = `repo:${req.params.id}:insights`;
        const cached = await getCache(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        const { id } = req.params;

        const repo = await getRepoById(id);

        if (!repo) {
            const error = new Error(`Repository with id '${id}' not found`);
            error.statusCode = 404;
            throw error;
        }

        const insight = await getInsightByRepoId(id);

        if (!insight) {
            const error = new Error(`No insights found for repository with id '${id}'`);
            error.statusCode = 404;
            throw error;
        }
        const response = {
            repository: repo.full_name,
            stars: repo.stars,
            forks: repo.forks,
            activityScore: insight.activity_score,
            complexityScore: insight.complexity_score,
            difficultyLevel: insight.difficulty_level
        };

        await setCache(cacheKey, response, 120);

        return res.status(200).json(response);
    } catch (error) {
        return next(error);
    }
};

const getRepositoryContributorsController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cacheKey = `repo:${id}:contributors`;
        const cached = await getCache(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }

        const repo = await getRepoById(id);
        if (!repo) {
            const error = new Error(`Repository with id '${id}' not found`);
            error.statusCode = 404;
            throw error;
        }

        const contributors = await getContributorsByRepoId(id);
        await setCache(cacheKey, contributors, 120);
        return res.status(200).json(contributors);
    } catch (error) {
        return next(error);
    }
};

export {
    addRepositoryController,
    getAllRepositoriesController,
    getRepositoryByIdController,
    getRepositoryInsightsController,
    getRepositoryContributorsController
};
