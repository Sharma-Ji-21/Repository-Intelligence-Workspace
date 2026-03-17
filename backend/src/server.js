import 'dotenv/config';
import app from './app.js';
import { testConnection } from './config/db.js';
import { testRedisConnection } from './config/redis.js';
import { startRepositorySyncJob } from './jobs/repositorySyncJob.js';

const PORT = process.env.PORT || 5050;

const startServer = async () => {
    try {
        await testConnection();
        console.log('Database connected successfully');

        await testRedisConnection();
        console.log('Redis connected successfully');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        startRepositorySyncJob();
        console.log('Repository sync job scheduled');
    } catch (error) {
        console.error('Startup connection failed:', error);
        process.exit(1);
    }
};

startServer();
