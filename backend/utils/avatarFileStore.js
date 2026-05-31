const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/db');

let tableReady = false;
const placeholderPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64'
);

async function ensureAvatarFilesTable() {
  if (tableReady) {
    return;
  }

  await pool.query(
    `CREATE TABLE IF NOT EXISTS avatar_files (
      path VARCHAR(255) PRIMARY KEY,
      mime_type VARCHAR(100) NOT NULL,
      data MEDIUMBLOB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  );

  tableReady = true;
}

function normalizeUploadPath(uploadPath) {
  return `/${String(uploadPath || '').replace(/^\/+/, '').replace(/\\/g, '/')}`;
}

async function saveAvatarFile(uploadPath, file) {
  if (!uploadPath || !file?.path) {
    return;
  }

  try {
    await ensureAvatarFilesTable();

    const data = await fs.readFile(file.path);
    await pool.query(
      `INSERT INTO avatar_files (path, mime_type, data)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE mime_type = VALUES(mime_type), data = VALUES(data)`,
      [normalizeUploadPath(uploadPath), file.mimetype || 'application/octet-stream', data]
    );
  } catch (error) {
    console.warn(`Gagal menyimpan fallback avatar ke database: ${uploadPath}`, error.message);
  }
}

async function removeAvatarFileData(uploadPath) {
  if (!uploadPath) {
    return;
  }

  try {
    await ensureAvatarFilesTable();
    await pool.query('DELETE FROM avatar_files WHERE path = ?', [normalizeUploadPath(uploadPath)]);
  } catch (error) {
    console.warn(`Gagal menghapus fallback avatar dari database: ${uploadPath}`, error.message);
  }
}

async function serveUploadedFile(req, res, next) {
  try {
    const uploadPath = normalizeUploadPath(req.originalUrl.split('?')[0]);
    const localPath = path.join(__dirname, '..', uploadPath.replace(/^\/+/, ''));

    try {
      await fs.access(localPath);
      return next();
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    let rows = [];

    try {
      await ensureAvatarFilesTable();

      [rows] = await pool.query(
        'SELECT mime_type, data FROM avatar_files WHERE path = ? LIMIT 1',
        [uploadPath]
      );
    } catch (error) {
      console.warn(`Gagal membaca fallback avatar dari database: ${uploadPath}`, error.message);
    }

    if (!rows[0]) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.send(placeholderPng);
    }

    res.setHeader('Content-Type', rows[0].mime_type);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(rows[0].data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  saveAvatarFile,
  removeAvatarFileData,
  serveUploadedFile,
};
