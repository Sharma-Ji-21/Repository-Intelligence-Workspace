import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import healthRoutes from './routes/healthRoutes.js';
import repoRoutes from './routes/repoRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/api', repoRoutes);
app.use('/api/webhooks', webhookRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
