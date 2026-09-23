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
        const res1 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'segmentada'");
        console.log("segmentada columns:", res1.rows);
        const res2 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'processo_status'");
        console.log("processo_status columns:", res2.rows);
        const res3 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'principal'");
        console.log("principal columns:", res3.rows);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
