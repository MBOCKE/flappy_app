require('dotenv').config();
const mysql = require('mysql2/promise');


const useSSL = process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user:process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    ...(useSSL && { ssl: { minVersion: 'TLSv1.2' } }),
});

module.exports = pool;
