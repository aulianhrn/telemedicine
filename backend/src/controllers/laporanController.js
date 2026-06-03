const PDFDocument = require('pdfkit');
const pool = require('../config/db');

// GET /api/laporan/rekap-bulanan
async function rekapBulanan(req, res, next) {
  try {
    const b = req.query.bulan || (new Date().getMonth() + 1);
    const t = req.query.tahun || new Date().getFullYear();

    const [[{ total_pemeriksaan }]] = await pool.query(
      `SELECT COUNT(*) AS total_pemeriksaan FROM pemeriksaan
       WHERE MONTH(tanggal_pemeriksaan)=? AND YEAR(tanggal_pemeriksaan)=?`, [b, t]
    );

    const [giziRows] = await pool.query(
      `SELECT status_gizi, COUNT(*) AS jumlah FROM pemeriksaan
       WHERE MONTH(tanggal_pemeriksaan)=? AND YEAR(tanggal_pemeriksaan)=?
       GROUP BY status_gizi`, [b, t]
    );
    const status_gizi = { normal: 0, kurang: 0, buruk: 0 };
    giziRows.forEach(r => { if (status_gizi[r.status_gizi] !== undefined) status_gizi[r.status_gizi] = r.jumlah; });

    const [[{ total_imu }]] = await pool.query(
      `SELECT COUNT(*) AS total_imu FROM imunisasi
       WHERE MONTH(tanggal_jadwal)=? AND YEAR(tanggal_jadwal)=?`, [b, t]
    );
    const [[{ selesai_imu }]] = await pool.query(
      `SELECT COUNT(*) AS selesai_imu FROM imunisasi
       WHERE status='selesai' AND MONTH(tanggal_jadwal)=? AND YEAR(tanggal_jadwal)=?`, [b, t]
    );

    const bulanNama = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    return res.json({
      success: true,
      data: {
        periode: `${bulanNama[b]} ${t}`,
        total_pemeriksaan,
        status_gizi,
        imunisasi: { total: total_imu, selesai: selesai_imu, pending: total_imu - selesai_imu },
      }
    });
  } catch (err) { return next(err); }
}

// POST /api/laporan/simpan
async function simpanLaporan(req, res, next) {
  try {
    const b = req.body.bulan || (new Date().getMonth() + 1);
    const t = req.body.tahun || new Date().getFullYear();
    const bulanNama = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    const [[{ total_anak }]] = await pool.query('SELECT COUNT(*) AS total_anak FROM anak');
    const [[{ total_stunting }]] = await pool.query(
      `SELECT COUNT(*) AS total_stunting FROM pemeriksaan
       WHERE status_gizi IN ('kurang','buruk') AND MONTH(tanggal_pemeriksaan)=? AND YEAR(tanggal_pemeriksaan)=?`, [b, t]
    );
    const [[{ total_imunisasi }]] = await pool.query(
      `SELECT COUNT(*) AS total_imunisasi FROM imunisasi
       WHERE status='selesai' AND MONTH(tanggal_jadwal)=? AND YEAR(tanggal_jadwal)=?`, [b, t]
    );

    await pool.query(
      `INSERT INTO laporan_posyandu (bulan_laporan, total_anak, total_stunting, total_imunisasi, dibuat_oleh)
       VALUES (?,?,?,?,?)`,
      [`${bulanNama[b]} ${t}`, total_anak, total_stunting, total_imunisasi, req.user.id]
    );

    return res.json({ success: true, message: 'Laporan berhasil disimpan.' });
  } catch (err) { return next(err); }
}

module.exports = { rekapBulanan, simpanLaporan };