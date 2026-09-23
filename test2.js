const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'database-1.c164mie8iq7b.us-east-2.rds.amazonaws.com',
    database: 'postgres',
    password: '0sbT3vpCrQX6mn7hEIhq',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const res = await pool.query("SELECT * FROM principal LIMIT 1");
        console.log(Object.keys(res.rows[0]));
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
