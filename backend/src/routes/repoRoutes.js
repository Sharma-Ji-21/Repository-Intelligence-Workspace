import { Router } from 'express';
import {
    addRepositoryController,
    getAllRepositoriesController,
    getRepositoryByIdController,
    getRepositoryInsightsController,
    getRepositoryContributorsController
} from '../controllers/repoController.js';
import { validateRepoUrl } from '../middlewares/validateRepoUrl.js';

const router = Router();

router.post('/repos', validateRepoUrl, addRepositoryController);
router.get('/repos', getAllRepositoriesController);
router.get('/repos/:id', getRepositoryByIdController);
router.get('/repos/:id/insights', getRepositoryInsightsController);
router.get('/repos/:id/contributors', getRepositoryContributorsController);

export default router;
