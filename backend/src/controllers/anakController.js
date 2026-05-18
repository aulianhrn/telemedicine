const pool = require('../config/db');

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

    return res.json(rows);
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

    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function createAnak(req, res, next) {
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

    const [result] = await pool.query(
      `INSERT INTO anak (ibu_id, nama, jenis_kelamin, tanggal_lahir, berat_lahir, tinggi_lahir)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [targetIbuId, nama, jenis_kelamin, tanggal_lahir, berat_lahir || null, tinggi_lahir || null]
    );

    return res.status(201).json({ id: result.insertId, message: 'Data anak berhasil ditambahkan' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listAnak, getAnak, createAnak };
