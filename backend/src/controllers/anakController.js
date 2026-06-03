const pool = require('../config/db');

// GET /api/anak
async function listAnak(req, res, next) {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const params = [];
    let where = 'WHERE 1=1';

    if (search) {
      where += ' AND (a.nama LIKE ? OR p.nama LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM anak a
       JOIN ibu i ON i.id = a.ibu_id
       JOIN pengguna p ON p.id = i.pengguna_id
       ${where}`, params
    );

    const [rows] = await pool.query(
      `SELECT a.id, a.nama, a.jenis_kelamin, a.tanggal_lahir, a.berat_lahir, a.tinggi_lahir,
              a.ibu_id, p.nama AS nama_ibu, p.no_hp AS no_hp_ibu,
              latest.berat_badan, latest.tinggi_badan, latest.status_gizi, latest.tanggal_pemeriksaan
       FROM anak a
       JOIN ibu i ON i.id = a.ibu_id
       JOIN pengguna p ON p.id = i.pengguna_id
       LEFT JOIN (
         SELECT pm.* FROM pemeriksaan pm
         JOIN (SELECT anak_id, MAX(tanggal_pemeriksaan) AS tgl FROM pemeriksaan GROUP BY anak_id) x
         ON x.anak_id = pm.anak_id AND x.tgl = pm.tanggal_pemeriksaan
       ) latest ON latest.anak_id = a.id
       ${where}
       ORDER BY a.id DESC
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

// GET /api/anak/:id
async function getAnak(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, p.nama AS nama_ibu, p.no_hp AS no_hp_ibu
       FROM anak a
       JOIN ibu i ON i.id = a.ibu_id
       JOIN pengguna p ON p.id = i.pengguna_id
       WHERE a.id = ? LIMIT 1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Data anak tidak ditemukan.' });

    const [pemeriksaan] = await pool.query(
      `SELECT pm.*, pb.nama AS nama_bidan
       FROM pemeriksaan pm
       LEFT JOIN bidan b ON b.id = pm.bidan_id
       LEFT JOIN pengguna pb ON pb.id = b.pengguna_id
       WHERE pm.anak_id = ?
       ORDER BY pm.tanggal_pemeriksaan DESC`,
      [req.params.id]
    );

    return res.json({ success: true, data: { ...rows[0], pemeriksaan } });
  } catch (err) { return next(err); }
}

// POST /api/anak
async function createAnak(req, res, next) {
  try {
    const { ibu_id, nama, tanggal_lahir, jenis_kelamin, berat_lahir, tinggi_lahir } = req.body;
    if (!ibu_id || !nama || !tanggal_lahir || !jenis_kelamin)
      return res.status(400).json({ success: false, message: 'ibu_id, nama, tanggal_lahir, jenis_kelamin wajib diisi.' });

    const [ibuCheck] = await pool.query('SELECT id FROM ibu WHERE id = ?', [ibu_id]);
    if (!ibuCheck.length) return res.status(404).json({ success: false, message: 'Data ibu tidak ditemukan.' });

    const [result] = await pool.query(
      'INSERT INTO anak (ibu_id, nama, tanggal_lahir, jenis_kelamin, berat_lahir, tinggi_lahir) VALUES (?, ?, ?, ?, ?, ?)',
      [ibu_id, nama, tanggal_lahir, jenis_kelamin, berat_lahir || null, tinggi_lahir || null]
    );

    return res.status(201).json({ success: true, message: 'Data anak berhasil ditambahkan.', data: { id: result.insertId, nama } });
  } catch (err) { return next(err); }
}

// PUT /api/anak/:id
async function updateAnak(req, res, next) {
  try {
    const { nama, tanggal_lahir, jenis_kelamin, berat_lahir, tinggi_lahir } = req.body;
    await pool.query(
      'UPDATE anak SET nama=?, tanggal_lahir=?, jenis_kelamin=?, berat_lahir=?, tinggi_lahir=? WHERE id=?',
      [nama, tanggal_lahir, jenis_kelamin, berat_lahir || null, tinggi_lahir || null, req.params.id]
    );
    return res.json({ success: true, message: 'Data anak berhasil diupdate.' });
  } catch (err) { return next(err); }
}

// DELETE /api/anak/:id
async function deleteAnak(req, res, next) {
  try {
    const [check] = await pool.query('SELECT id FROM anak WHERE id = ?', [req.params.id]);
    if (!check.length) return res.status(404).json({ success: false, message: 'Data anak tidak ditemukan.' });
    await pool.query('DELETE FROM anak WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Data anak berhasil dihapus.' });
  } catch (err) { return next(err); }
}

// POST /api/anak/:id/pemeriksaan
async function createPemeriksaan(req, res, next) {
  try {
    const anakId = req.params.id;
    const berat_badan  = req.body.berat_badan  ?? req.body.weight;
    const tinggi_badan = req.body.tinggi_badan ?? req.body.height;
    const lingkar_kepala = req.body.lingkar_kepala ?? req.body.head_circumference ?? null;
    const tanggal_pemeriksaan = req.body.tanggal_pemeriksaan ?? req.body.examination_date;
    const catatan = req.body.catatan ?? req.body.notes ?? null;
    let status_gizi = req.body.status_gizi ?? req.body.nutrition_status ?? null;

    if (!berat_badan || !tinggi_badan || !tanggal_pemeriksaan)
      return res.status(400).json({ success: false, message: 'berat_badan, tinggi_badan, tanggal_pemeriksaan wajib diisi.' });

    if (!status_gizi) {
      const [anakRows] = await pool.query('SELECT tanggal_lahir, jenis_kelamin FROM anak WHERE id = ?', [anakId]);
      if (anakRows[0]) {
        const bmi = parseFloat(berat_badan) / Math.pow(parseFloat(tinggi_badan) / 100, 2);
        if (bmi < 14) status_gizi = 'buruk';
        else if (bmi < 16) status_gizi = 'kurang';
        else status_gizi = 'normal';
      }
    }

    const bidanId = req.user.bidanId;
    if (!bidanId)
      return res.status(400).json({ success: false, message: 'Akun ini tidak terdaftar sebagai bidan.' });

    const [result] = await pool.query(
      `INSERT INTO pemeriksaan (anak_id, bidan_id, berat_badan, tinggi_badan, lingkar_kepala, status_gizi, tanggal_pemeriksaan, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [anakId, bidanId, berat_badan, tinggi_badan, lingkar_kepala, status_gizi, tanggal_pemeriksaan, catatan]
    );

    return res.status(201).json({
      success: true,
      message: 'Pemeriksaan berhasil dicatat.',
      data: { id: result.insertId, anak_id: anakId, berat_badan, tinggi_badan, status_gizi, tanggal_pemeriksaan },
    });
  } catch (err) { return next(err); }
}

// PUT /api/pemeriksaan/:id  — edit data pemeriksaan
async function updatePemeriksaan(req, res, next) {
  try {
    const { berat_badan, tinggi_badan, lingkar_kepala, tanggal_pemeriksaan, catatan } = req.body;

    if (!berat_badan || !tinggi_badan || !tanggal_pemeriksaan)
      return res.status(400).json({ success: false, message: 'berat_badan, tinggi_badan, tanggal_pemeriksaan wajib diisi.' });

    const [check] = await pool.query('SELECT id FROM pemeriksaan WHERE id = ?', [req.params.id]);
    if (!check.length) return res.status(404).json({ success: false, message: 'Data pemeriksaan tidak ditemukan.' });

    // Hitung ulang status gizi
    const bmi = parseFloat(berat_badan) / Math.pow(parseFloat(tinggi_badan) / 100, 2);
    let status_gizi = 'normal';
    if (bmi < 14) status_gizi = 'buruk';
    else if (bmi < 16) status_gizi = 'kurang';

    await pool.query(
      `UPDATE pemeriksaan SET berat_badan=?, tinggi_badan=?, lingkar_kepala=?, status_gizi=?, tanggal_pemeriksaan=?, catatan=? WHERE id=?`,
      [berat_badan, tinggi_badan, lingkar_kepala || null, status_gizi, tanggal_pemeriksaan, catatan || null, req.params.id]
    );

    return res.json({ success: true, message: 'Data pemeriksaan berhasil diupdate.' });
  } catch (err) { return next(err); }
}

// DELETE /api/pemeriksaan/:id — hapus data pemeriksaan
async function deletePemeriksaan(req, res, next) {
  try {
    const [check] = await pool.query('SELECT id FROM pemeriksaan WHERE id = ?', [req.params.id]);
    if (!check.length) return res.status(404).json({ success: false, message: 'Data pemeriksaan tidak ditemukan.' });

    await pool.query('DELETE FROM pemeriksaan WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Data pemeriksaan berhasil dihapus.' });
  } catch (err) { return next(err); }
}

// GET /api/anak/:id/grafik
async function grafikPertumbuhan(req, res, next) {
  try {
    const [anak] = await pool.query('SELECT id, nama, tanggal_lahir, jenis_kelamin FROM anak WHERE id = ?', [req.params.id]);
    if (!anak[0]) return res.status(404).json({ success: false, message: 'Data anak tidak ditemukan.' });

    const [rows] = await pool.query(
      `SELECT tanggal_pemeriksaan, berat_badan, tinggi_badan, lingkar_kepala, status_gizi
       FROM pemeriksaan WHERE anak_id = ? ORDER BY tanggal_pemeriksaan ASC`,
      [req.params.id]
    );

    const birth = new Date(anak[0].tanggal_lahir);
    const grafik = rows.map(r => ({
      tanggal: r.tanggal_pemeriksaan,
      umur_bulan: Math.floor((new Date(r.tanggal_pemeriksaan) - birth) / (1000 * 60 * 60 * 24 * 30)),
      berat_badan: r.berat_badan,
      tinggi_badan: r.tinggi_badan,
      lingkar_kepala: r.lingkar_kepala,
      status_gizi: r.status_gizi,
    }));

    return res.json({ success: true, data: { anak: anak[0], grafik } });
  } catch (err) { return next(err); }
}

module.exports = { listAnak, getAnak, createAnak, updateAnak, deleteAnak, createPemeriksaan, updatePemeriksaan, deletePemeriksaan, grafikPertumbuhan };