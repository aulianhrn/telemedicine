const pool = require('../config/db');

async function listImunisasi(req, res, next) {
  try {
    const params = [];
    let where = '';

    if (req.query.anak_id) {
      where = 'WHERE im.anak_id = ?';
      params.push(req.query.anak_id);
    } else if (req.user.role === 'ibu' && req.user.ibuId) {
      where = 'WHERE a.ibu_id = ?';
      params.push(req.user.ibuId);
    }

    const [rows] = await pool.query(
      `SELECT im.*, a.nama AS nama_anak
       FROM imunisasi im
       JOIN anak a ON a.id = im.anak_id
       ${where}
       ORDER BY im.tanggal_jadwal ASC, im.id ASC`,
      params
    );

    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function createImunisasi(req, res, next) {
  try {
    const { anak_id, nama_vaksin, tanggal_jadwal, tanggal_imunisasi, status } = req.body;

    if (!anak_id || !nama_vaksin || !tanggal_jadwal) {
      return res.status(400).json({ message: 'anak_id, nama_vaksin, dan tanggal_jadwal wajib diisi' });
    }

    const [result] = await pool.query(
      `INSERT INTO imunisasi (anak_id, nama_vaksin, tanggal_jadwal, tanggal_imunisasi, status)
       VALUES (?, ?, ?, ?, ?)`,
      [anak_id, nama_vaksin, tanggal_jadwal, tanggal_imunisasi || null, status || 'pending']
    );

    return res.status(201).json({ id: result.insertId, message: 'Jadwal imunisasi berhasil ditambahkan' });
  } catch (error) {
    return next(error);
  }
}

async function updateStatusImunisasi(req, res, next) {
  try {
    const { tanggal_imunisasi, status } = req.body;

    await pool.query(
      `UPDATE imunisasi
       SET tanggal_imunisasi = ?, status = ?
       WHERE id = ?`,
      [tanggal_imunisasi || null, status || 'pending', req.params.id]
    );

    return res.json({ message: 'Status imunisasi berhasil diperbarui' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listImunisasi, createImunisasi, updateStatusImunisasi };
