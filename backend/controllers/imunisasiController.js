const pool = require('../config/db');

function normalizeImunisasi(row) {
  return {
    ...row,
    child_id: row.anak_id,
    vaccine_name: row.nama_vaksin,
    schedule_date: row.tanggal_jadwal,
    immunization_date: row.tanggal_imunisasi,
  };
}

async function listImunisasi(req, res, next) {
  try {
    const params = [];
    let where = '';

    const childId = req.query.child_id || req.query.anak_id;

    if (childId) {
      where = 'WHERE im.anak_id = ?';
      params.push(childId);
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

    return res.json(rows.map(normalizeImunisasi));
  } catch (error) {
    return next(error);
  }
}

async function createImunisasi(req, res, next) {
  try {
    const childId = req.body.child_id || req.body.anak_id;
    const vaccineName = req.body.vaccine_name || req.body.nama_vaksin;
    const scheduleDate = req.body.schedule_date || req.body.tanggal_jadwal;
    const immunizationDate = req.body.immunization_date || req.body.tanggal_imunisasi;
    const status = req.body.status || 'pending';

    if (!childId || !vaccineName || !scheduleDate) {
      return res.status(400).json({ message: 'child_id, vaccine_name, dan schedule_date wajib diisi' });
    }

    const [result] = await pool.query(
      `INSERT INTO imunisasi (anak_id, nama_vaksin, tanggal_jadwal, tanggal_imunisasi, status)
       VALUES (?, ?, ?, ?, ?)`,
      [childId, vaccineName, scheduleDate, immunizationDate || null, status]
    );

    return res.status(201).json({
      id: result.insertId,
      child_id: Number(childId),
      vaccine_name: vaccineName,
      schedule_date: scheduleDate,
      status,
      sql_table: 'immunizations',
      message: 'Jadwal imunisasi berhasil ditambahkan ke SQL',
    });
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
