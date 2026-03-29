import 'dotenv/config'
import { Worker } from 'bullmq';
import { redis } from '../config/redis.js';
import { getRepositoryById, updateRepositoryStats, updateContributorCount } from '../models/repoModel.js';
import { calculateActivityScore, calculateComplexityScore, classifyDifficulty } from '../services/analysisService.js';
import { createInsight } from '../models/insightModel.js';
import * as githubService from '../services/githubService.js';
import { deleteContributorsByRepoId, createContributors } from '../models/contributorModel.js';
import { deleteCache } from '../utils/cache.js';

const worker = new Worker(
    'repository-analysis',
    async (job) => {
        const { repoId } = job.data;

        console.log(`Processing analysis for repository: ${repoId}`);

        const repo = await getRepositoryById(repoId);

        if (!repo) {
            throw new Error(`Repository not found for id: ${repoId}`);
        }

        const [
            latestRepoData,
            contributorData,
            recentCommits,
            pullRequests,
            languageCount,
            dependencyCount
        ] = await Promise.all([
            githubService.fetchRepository(repo.owner, repo.name),
            githubService.fetchRepositoryContributors(repo.owner, repo.name),
            githubService.fetchRecentCommits(repo.owner, repo.name),
            githubService.fetchPullRequests(repo.owner, repo.name),
            githubService.fetchLanguages(repo.owner, repo.name),
            githubService.fetchDependencyCount(repo.owner, repo.name)
        ]);

        const enrichedRepoData = {
            ...latestRepoData,
            contributors_count: contributorData.contributorsCount,
            recent_commits: recentCommits,
            pull_requests: pullRequests,
            language_count: languageCount,
            dependency_count: dependencyCount
        };

        await updateRepositoryStats(repoId, enrichedRepoData);
        await deleteCache(`repo:${repoId}`);

        await updateContributorCount(repoId, contributorData.contributorsCount);

        await deleteContributorsByRepoId(repoId);
        if (contributorData.contributors.length > 0) {
            await createContributors(repoId, contributorData.contributors);
            await deleteCache(`repo:${repoId}:contributors`);

        }

        console.log(
            `Stored ${contributorData.contributors.length} contributors for repository ${latestRepoData.full_name}`
        );

        const { activityScore } = calculateActivityScore(enrichedRepoData);
        const { complexityScore } = calculateComplexityScore(enrichedRepoData);
        const { difficultyLevel } = classifyDifficulty(activityScore, complexityScore);

        await createInsight(
            repoId,
            activityScore,
            complexityScore,
            difficultyLevel
        );
        await deleteCache(`repo:${repoId}:insights`);

        console.log(
            `Analysis completed for ${latestRepoData.full_name}
             | Activity: ${activityScore}
             | Complexity: ${complexityScore}
             | Difficulty: ${difficultyLevel}`
        );

        return {
            repoId,
            activityScore,
            complexityScore,
            difficultyLevel
        };
    },
    {
        connection: redis
    }
);

worker.on('completed', (job) => {
    console.log(`Job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
    console.error(`Job failed: ${job?.id}`, err);
});

export { worker };
