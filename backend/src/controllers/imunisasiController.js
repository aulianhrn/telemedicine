const pool = require('../config/db');

// GET /api/imunisasi
async function listImunisasi(req, res, next) {
  try {
    const { status, bulan, tahun, anak_id, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const params = [];
    let where = 'WHERE 1=1';

    if (anak_id) { where += ' AND im.anak_id = ?'; params.push(Number(anak_id)); }
    if (status)  { where += ' AND im.status = ?';  params.push(status); }
    if (bulan && tahun) {
      where += ' AND MONTH(im.tanggal_jadwal) = ? AND YEAR(im.tanggal_jadwal) = ?';
      params.push(Number(bulan), Number(tahun));
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM imunisasi im JOIN anak a ON a.id = im.anak_id ${where}`, params
    );

    const [rows] = await pool.query(
      `SELECT im.*, a.nama AS nama_anak,
              pi.nama AS nama_ibu
       FROM imunisasi im
       JOIN anak a ON a.id = im.anak_id
       JOIN ibu i ON i.id = a.ibu_id
       JOIN pengguna pi ON pi.id = i.pengguna_id
       ${where}
       ORDER BY im.tanggal_jadwal ASC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    return res.json({
      success: true,
      data: rows,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { return next(err); }
}

// GET /api/imunisasi/:id
async function getImunisasi(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT im.*, a.nama AS nama_anak,
              pi.nama AS nama_ibu
       FROM imunisasi im
       JOIN anak a ON a.id = im.anak_id
       JOIN ibu i ON i.id = a.ibu_id
       JOIN pengguna pi ON pi.id = i.pengguna_id
       WHERE im.id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Jadwal imunisasi tidak ditemukan.' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) { return next(err); }
}

// POST /api/imunisasi
async function createImunisasi(req, res, next) {
  try {
    const anak_id        = req.body.anak_id     ?? req.body.child_id;
    const nama_vaksin    = req.body.nama_vaksin  ?? req.body.vaccine_name;
    const tanggal_jadwal = req.body.tanggal_jadwal ?? req.body.schedule_date;

    if (!anak_id || !nama_vaksin || !tanggal_jadwal)
      return res.status(400).json({ success: false, message: 'anak_id, nama_vaksin, tanggal_jadwal wajib diisi.' });

    const [anakCheck] = await pool.query('SELECT id FROM anak WHERE id = ?', [anak_id]);
    if (!anakCheck.length)
      return res.status(404).json({ success: false, message: 'Data anak tidak ditemukan.' });

    const VALID_STATUS = ['pending', 'selesai', 'terjadwal', 'terlewat'];
    const status = VALID_STATUS.includes(req.body.status) ? req.body.status : 'pending';

    const [result] = await pool.query(
      'INSERT INTO imunisasi (anak_id, nama_vaksin, tanggal_jadwal, status) VALUES (?, ?, ?, ?)',
      [anak_id, nama_vaksin, tanggal_jadwal, status]
    );

    return res.status(201).json({
      success: true,
      message: 'Jadwal imunisasi ditambahkan.',
      data: { id: result.insertId },
    });
  } catch (err) { return next(err); }
}

// PUT /api/imunisasi/:id
async function updateImunisasi(req, res, next) {
  try {
    const anak_id = req.body.anak_id ?? req.body.child_id;
    const nama_vaksin = req.body.nama_vaksin ?? req.body.vaccine_name;
    const tanggal_jadwal = req.body.tanggal_jadwal ?? req.body.schedule_date;
    const { status, tanggal_imunisasi } = req.body;

    if (!anak_id || !nama_vaksin || !tanggal_jadwal) {
      return res.status(400).json({ success: false, message: 'anak_id, nama_vaksin, tanggal_jadwal wajib diisi.' });
    }

    const [check] = await pool.query('SELECT id FROM imunisasi WHERE id = ?', [req.params.id]);
    if (!check.length) {
      return res.status(404).json({ success: false, message: 'Jadwal imunisasi tidak ditemukan.' });
    }

    const [anakCheck] = await pool.query('SELECT id FROM anak WHERE id = ?', [anak_id]);
    if (!anakCheck.length) {
      return res.status(404).json({ success: false, message: 'Data anak tidak ditemukan.' });
    }

    await pool.query(
      `UPDATE imunisasi
       SET anak_id = ?, nama_vaksin = ?, tanggal_jadwal = ?, status = ?, tanggal_imunisasi = ?
       WHERE id = ?`,
      [anak_id, nama_vaksin, tanggal_jadwal, status || 'pending', tanggal_imunisasi || null, req.params.id]
    );

    return res.json({ success: true, message: 'Jadwal imunisasi diperbarui.' });
  } catch (err) { return next(err); }
}

// PATCH /api/imunisasi/:id/status
async function updateStatus(req, res, next) {
  try {
    const { status, tanggal_imunisasi } = req.body;
    const newStatus = status || 'selesai';
    const tgl = tanggal_imunisasi || new Date().toISOString().split('T')[0];

    const [check] = await pool.query('SELECT id FROM imunisasi WHERE id = ?', [req.params.id]);
    if (!check.length)
      return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan.' });

    await pool.query(
      'UPDATE imunisasi SET status=?, tanggal_imunisasi=? WHERE id=?',
      [newStatus, tgl, req.params.id]
    );

    return res.json({ success: true, message: `Imunisasi ditandai ${newStatus}.` });
  } catch (err) { return next(err); }
}

// DELETE /api/imunisasi/:id
async function deleteImunisasi(req, res, next) {
  try {
    await pool.query('DELETE FROM imunisasi WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Jadwal imunisasi dihapus.' });
  } catch (err) { return next(err); }
}

module.exports = { listImunisasi, getImunisasi, createImunisasi, updateImunisasi, updateStatus, deleteImunisasi };
