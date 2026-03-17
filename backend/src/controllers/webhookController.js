import { getRepositoryByFullName } from '../models/repoModel.js';
import { enqueueRepositoryAnalysis } from '../queues/repoQueue.js';

const githubWebhookController = async (req, res, next) => {
    try {
        const eventType = req.headers['x-github-event'];

        if (eventType !== 'push') {
            return res.status(200).json({ message: 'Event ignored' });
        }

        const repoFullName = req.body?.repository?.full_name;

        if (!repoFullName) {
            const error = new Error('Invalid webhook payload: repository.full_name is required');
            error.statusCode = 400;
            throw error;
        }

        const repo = await getRepositoryByFullName(repoFullName);

        if (!repo) {
            return res.status(200).json({ message: 'Repository not tracked' });
        }

        enqueueRepositoryAnalysis(repo.id);

        console.log(`Webhook triggered analysis for ${repoFullName}`);

        return res.status(200).json({ message: 'Repository re-analysis triggered' });
    } catch (error) {
        return next(error);
    }
};

export { githubWebhookController };
