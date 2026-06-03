require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  connectTimeout: 30000,
};

// Kalau pakai Cloud SQL socket (Cloud Run → Cloud SQL)
if (process.env.DB_SOCKET_PATH) {
  dbConfig.socketPath = process.env.DB_SOCKET_PATH;
  // Socket tidak perlu SSL
} else {
  // Konek via IP biasa
  dbConfig.host = process.env.DB_HOST;
  dbConfig.port = Number(process.env.DB_PORT || 3306);
  if (process.env.DB_SSL === 'true') {
    dbConfig.ssl = { rejectUnauthorized: false };
  }
}

const pool = mysql.createPool(dbConfig);

pool.getConnection()
  .then(conn => {
    console.log('✅ Database terhubung:', process.env.DB_SOCKET_PATH || process.env.DB_HOST);
    conn.release();
  })
  .catch(err => {
    console.error('❌ Koneksi DB gagal:', err.code, '-', err.message);
    console.error('   Socket:', process.env.DB_SOCKET_PATH);
    console.error('   Host  :', process.env.DB_HOST);
    console.error('   User  :', process.env.DB_USER);
  });

module.exports = pool;