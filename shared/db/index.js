import {Pool} from 'pg';

const pool  = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    statement_timeout: 5000,
})

export default pool;