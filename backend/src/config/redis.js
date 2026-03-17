import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = Number.parseInt(process.env.REDIS_PORT || '6379', 10);

const redis = new Redis({
    host: redisHost,
    port: redisPort,
    lazyConnect: true,
    maxRetriesPerRequest: null,
    retryStrategy: () => null
});

const validateRedisConfig = () => {
    if (Number.isNaN(redisPort)) {
        throw new Error('REDIS_PORT must be a valid number');
    }
};

const testRedisConnection = async () => {
    validateRedisConfig();

    if (redis.status === 'wait') {
        await redis.connect();
    }

    await redis.ping();
};

export { redis, testRedisConnection };
