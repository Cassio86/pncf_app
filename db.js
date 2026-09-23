// Arquivo: db.js
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'database-1.c164mie8iq7b.us-east-2.rds.amazonaws.com',
    database: 'postgres',
    password: '0sbT3vpCrQX6mn7hEIhq',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

module.exports = pool; // Exporta a conexão para ser usada em outros lugares