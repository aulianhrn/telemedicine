const pool = require('../config/db');

async function dashboard(req, res, next) {
  try {
    const params = [];
    let anakWhere = '';
    let imunisasiWhere = '';

    if (req.user.role === 'ibu' && req.user.ibuId) {
      anakWhere = 'WHERE a.ibu_id = ?';
      imunisasiWhere = 'AND a.ibu_id = ?';
      params.push(req.user.ibuId);
    }

    const [anakRows] = await pool.query(
      `SELECT a.*, latest.berat_badan, latest.tinggi_badan, latest.lingkar_kepala,
              latest.status_gizi, latest.tanggal_pemeriksaan
       FROM anak a
       LEFT JOIN (
         SELECT pm.*
         FROM pemeriksaan pm
         JOIN (
           SELECT anak_id, MAX(tanggal_pemeriksaan) AS tanggal_pemeriksaan
           FROM pemeriksaan
           GROUP BY anak_id
         ) x ON x.anak_id = pm.anak_id AND x.tanggal_pemeriksaan = pm.tanggal_pemeriksaan
       ) latest ON latest.anak_id = a.id
       ${anakWhere}
       ORDER BY a.created_at DESC
       LIMIT 1`,
      params
    );

    const imunisasiParams = req.user.role === 'ibu' && req.user.ibuId ? [req.user.ibuId] : [];
    const [imunisasiRows] = await pool.query(
      `SELECT im.*, a.nama AS nama_anak
       FROM imunisasi im
       JOIN anak a ON a.id = im.anak_id
       WHERE im.status = 'pending'
         AND im.tanggal_jadwal >= CURDATE()
         ${imunisasiWhere}
       ORDER BY im.tanggal_jadwal ASC
       LIMIT 1`,
      imunisasiParams
    );

    return res.json({
      anak_utama: anakRows[0] || null,
      imunisasi_mendatang: imunisasiRows[0] || null,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { dashboard };
