const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/db');
const { removeAvatarFileData, saveAvatarFile } = require('../utils/avatarFileStore');
const { createAvatarPath } = require('../utils/cloudStorage');

function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

function withAvatarUrl(anak, req) {
  if (!anak) {
    return anak;
  }

  return {
    ...anak,
    ava_pict_url: anak.ava_pict ? `${getBaseUrl(req)}${anak.ava_pict}` : null,
  };
}

function mapWithAvatarUrl(rows, req) {
  return rows.map((row) => withAvatarUrl(row, req));
}

async function removeAvatarFile(avatarPath) {
  if (!avatarPath) {
    return;
  }

  const relativePath = avatarPath.replace(/^\/+/, '');
  const filePath = path.join(__dirname, '..', relativePath);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`Gagal menghapus file avatar anak lama: ${filePath}`, error.message);
    }
  }

  await removeAvatarFileData(avatarPath);
}

async function listAnak(req, res, next) {
  try {
    const params = [];
    let where = '';

    if (req.user.role === 'ibu' && req.user.ibuId) {
      where = 'WHERE a.ibu_id = ?';
      params.push(req.user.ibuId);
    } else if (req.query.ibu_id) {
      where = 'WHERE a.ibu_id = ?';
      params.push(req.query.ibu_id);
    }

    const [rows] = await pool.query(
      `SELECT a.*, i.nik, p.nama AS nama_ibu,
              latest.berat_badan, latest.tinggi_badan, latest.lingkar_kepala,
              latest.status_gizi, latest.tanggal_pemeriksaan
       FROM anak a
       JOIN ibu i ON i.id = a.ibu_id
       JOIN pengguna p ON p.id = i.pengguna_id
       LEFT JOIN (
         SELECT pm.*
         FROM pemeriksaan pm
         JOIN (
           SELECT anak_id, MAX(tanggal_pemeriksaan) AS tanggal_pemeriksaan
           FROM pemeriksaan
           GROUP BY anak_id
         ) x ON x.anak_id = pm.anak_id AND x.tanggal_pemeriksaan = pm.tanggal_pemeriksaan
       ) latest ON latest.anak_id = a.id
       ${where}
       ORDER BY a.created_at DESC`,
      params
    );

    return res.json(mapWithAvatarUrl(rows, req));
  } catch (error) {
    return next(error);
  }
}

async function getAnak(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, latest.berat_badan, latest.tinggi_badan, latest.lingkar_kepala,
              latest.status_gizi, latest.tanggal_pemeriksaan
       FROM anak a
       LEFT JOIN (
         SELECT *
         FROM pemeriksaan
         WHERE anak_id = ?
         ORDER BY tanggal_pemeriksaan DESC, id DESC
         LIMIT 1
       ) latest ON latest.anak_id = a.id
       WHERE a.id = ?
       LIMIT 1`,
      [req.params.id, req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'Data anak tidak ditemukan' });
    }

    if (req.user.role === 'ibu' && Number(rows[0].ibu_id) !== Number(req.user.ibuId)) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke data anak ini' });
    }

    return res.json(withAvatarUrl(rows[0], req));
  } catch (error) {
    return next(error);
  }
}

async function createAnak(req, res, next) {
  let avatarPath = null;

  try {
    const {
      ibu_id,
      nama,
      jenis_kelamin,
      tanggal_lahir,
      berat_lahir,
      tinggi_lahir,
    } = req.body;

    const targetIbuId = req.user.role === 'ibu' ? req.user.ibuId : ibu_id;

    if (!targetIbuId || !nama || !jenis_kelamin || !tanggal_lahir) {
      return res.status(400).json({
        message: 'ibu_id, nama, jenis_kelamin, dan tanggal_lahir wajib diisi',
      });
    }

    avatarPath = req.file ? createAvatarPath(req.file, 'anak') : null;
    await saveAvatarFile(avatarPath, req.file);

    const [result] = await pool.query(
      `INSERT INTO anak (ibu_id, nama, jenis_kelamin, tanggal_lahir, berat_lahir, tinggi_lahir, ava_pict)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        targetIbuId,
        nama,
        jenis_kelamin,
        tanggal_lahir,
        berat_lahir || null,
        tinggi_lahir || null,
        avatarPath,
      ]
    );

    return res.status(201).json({
      id: result.insertId,
      message: 'Data anak berhasil ditambahkan',
      ava_pict: avatarPath,
      ava_pict_url: avatarPath ? `${getBaseUrl(req)}${avatarPath}` : null,
    });
  } catch (error) {
    if (avatarPath) {
      await removeAvatarFile(avatarPath);
    }
    return next(error);
  }
}

async function updateAnakAvatar(req, res, next) {
  let avatarPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File ava_pict wajib diunggah' });
    }

    const [rows] = await pool.query(
      'SELECT id, ibu_id, ava_pict FROM anak WHERE id = ? LIMIT 1',
      [req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'Data anak tidak ditemukan' });
    }

    if (req.user.role === 'ibu' && Number(rows[0].ibu_id) !== Number(req.user.ibuId)) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke data anak ini' });
    }

    avatarPath = createAvatarPath(req.file, 'anak');
    await saveAvatarFile(avatarPath, req.file);

    await pool.query(
      'UPDATE anak SET ava_pict = ? WHERE id = ?',
      [avatarPath, req.params.id]
    );

    await removeAvatarFile(rows[0].ava_pict);

    return res.json({
      message: 'Foto profil anak berhasil diperbarui',
      ava_pict: avatarPath,
      ava_pict_url: `${getBaseUrl(req)}${avatarPath}`,
    });
  } catch (error) {
    if (avatarPath) {
      await removeAvatarFile(avatarPath);
    }
    return next(error);
  }
}

module.exports = { listAnak, getAnak, createAnak, updateAnakAvatar };
