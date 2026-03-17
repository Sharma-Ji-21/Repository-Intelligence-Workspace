import { redis } from '../config/redis.js';

const getCache = async (key) => {
    const value = await redis.get(key);

    if (value === null) {
        return null;
    }

    return JSON.parse(value);
};

const setCache = async (key, value, ttl=120) => {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
};

const deleteCache = async (key) => {
    await redis.del(key);
};

export { getCache, setCache, deleteCache };
