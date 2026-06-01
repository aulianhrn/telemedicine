require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  connectTimeout: 30000,
  ssl: { rejectUnauthorized: false },  // ← langsung aktif, tidak pakai if
};

if (process.env.DB_SOCKET_PATH) {
  dbConfig.socketPath = process.env.DB_SOCKET_PATH;
  delete dbConfig.host;
  delete dbConfig.port;
}

dbConfig.ssl = { rejectUnauthorized: false };

const pool = mysql.createPool(dbConfig);

pool.getConnection()
  .then(conn => {
    console.log('✅ Database terhubung ke:', process.env.DB_HOST);
    conn.release();
  })
  .catch(err => {
    console.error('❌ Koneksi DB gagal:', err.code, '-', err.message);
    console.error('   Host:', process.env.DB_HOST);
    console.error('   User:', process.env.DB_USER);
    console.error('   SSL :', process.env.DB_SSL);
  });

module.exports = pool;