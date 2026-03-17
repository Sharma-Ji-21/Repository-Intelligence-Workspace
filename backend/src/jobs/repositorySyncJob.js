import cron from 'node-cron';
import { getAllRepositories } from '../models/repoModel.js';
import { enqueueRepositoryAnalysis } from '../queues/repoQueue.js';

const startRepositorySyncJob = () => {
    return cron.schedule('0 * * * *', async () => {
        try {
            console.log('Running scheduled repository sync job...');

            const repositories = await getAllRepositories();

            await Promise.all(
                repositories.map((repo) => enqueueRepositoryAnalysis(repo.id))
            );

            console.log(`Queued analysis for ${repositories.length} repositories`);
        } catch (error) {
            console.error('Repository sync job failed:', error.message);
        }
    });
};

export { startRepositorySyncJob };