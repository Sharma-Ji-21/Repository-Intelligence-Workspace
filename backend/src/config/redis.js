import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = Number.parseInt(process.env.REDIS_PORT || '6379', 10);

const redis = new Redis({
    host: redisHost,
    port: redisPort,
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    tls: {},
    lazyConnect: true,
    maxRetriesPerRequest: null,

    retryStrategy(times) {
        return Math.min(times * 200, 2000);
    },

    reconnectOnError() {
        return true;
    }
});

redis.on('connect', () => {
    console.log('Redis connected successfully');
});

redis.on('error', (err) => {
    console.error('Redis error:', err.message);
});

redis.on('close', () => {
    console.warn('Redis connection closed, reconnecting...');
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
