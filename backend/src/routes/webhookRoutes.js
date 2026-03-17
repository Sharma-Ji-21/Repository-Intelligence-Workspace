import { Router } from 'express';
import { githubWebhookController } from '../controllers/webhookController.js';

const router = Router();

router.post('/github', githubWebhookController);

export default router;
