import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

const validateDbConfig = () => {
    const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missingVars = requiredVars.filter((name) => !process.env[name]);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
};

const query = (text, params) => pool.query(text, params);

const testConnection = async () => {
    validateDbConfig();
    await query('SELECT NOW()');
};

export { pool, query, testConnection };
