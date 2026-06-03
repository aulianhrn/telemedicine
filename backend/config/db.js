const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'telemed',
  password: process.env.DB_PASSWORD || 'Telemed123!',
  database: process.env.DB_NAME || 'telemedicine_posyandu',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
};



if (process.env.DB_SOCKET_PATH) {
  dbConfig.socketPath = process.env.DB_SOCKET_PATH;
  delete dbConfig.host;
  delete dbConfig.port;
}

if (process.env.DB_SSL === 'true' && !process.env.DB_SOCKET_PATH) {
  dbConfig.ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false,
  };
}

const pool = mysql.createPool(dbConfig);

module.exports = pool;
