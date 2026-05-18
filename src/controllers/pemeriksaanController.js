const pool = require('../config/db');

async function listPemeriksaan(req, res, next) {
  try {
    const params = [];
    let where = '';

    if (req.query.anak_id) {
      where = 'WHERE pm.anak_id = ?';
      params.push(req.query.anak_id);
    } else if (req.user.role === 'ibu' && req.user.ibuId) {
      where = 'WHERE a.ibu_id = ?';
      params.push(req.user.ibuId);
    }

    const [rows] = await pool.query(
      `SELECT pm.*, a.nama AS nama_anak, pb.nama AS nama_bidan
       FROM pemeriksaan pm
       JOIN anak a ON a.id = pm.anak_id
       JOIN bidan b ON b.id = pm.bidan_id
       JOIN pengguna pb ON pb.id = b.pengguna_id
       ${where}
       ORDER BY pm.tanggal_pemeriksaan DESC, pm.id DESC`,
      params
    );

    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function createPemeriksaan(req, res, next) {
  try {
    const {
      anak_id,
      bidan_id,
      berat_badan,
      tinggi_badan,
      lingkar_kepala,
      status_gizi,
      tanggal_pemeriksaan,
      catatan,
    } = req.body;

    const targetBidanId = req.user.role === 'bidan' ? req.user.bidanId : bidan_id;

    if (!anak_id || !targetBidanId || !berat_badan || !tinggi_badan || !tanggal_pemeriksaan) {
      return res.status(400).json({
        message: 'anak_id, bidan_id, berat_badan, tinggi_badan, dan tanggal_pemeriksaan wajib diisi',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO pemeriksaan
       (anak_id, bidan_id, berat_badan, tinggi_badan, lingkar_kepala, status_gizi, tanggal_pemeriksaan, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        anak_id,
        targetBidanId,
        berat_badan,
        tinggi_badan,
        lingkar_kepala || null,
        status_gizi || null,
        tanggal_pemeriksaan,
        catatan || null,
      ]
    );

    return res.status(201).json({ id: result.insertId, message: 'Pemeriksaan berhasil ditambahkan' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listPemeriksaan, createPemeriksaan };
