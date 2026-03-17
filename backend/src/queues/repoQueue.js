import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';

const repoQueue = new Queue('repository-analysis', {
    connection: redis
});

const enqueueRepositoryAnalysis = async (repoId) => {
    const job = await repoQueue.add('analyze-repository', {
        repoId
    });

    console.log(`Analysis job queued for repository: ${repoId}`);

    return job;
};

export { repoQueue, enqueueRepositoryAnalysis };
