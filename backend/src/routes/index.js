const express = require('express');
const router = express.Router();
const { auth, requireBidanOrAdmin, requireAdmin } = require('../middleware/auth');

const authCtrl       = require('../controllers/authController');
const dashCtrl       = require('../controllers/dashboardController');
const anakCtrl       = require('../controllers/anakController');
const ibuCtrl        = require('../controllers/ibuController');
const imuCtrl        = require('../controllers/imunisasiController');
const laporanCtrl    = require('../controllers/laporanController');

// ── AUTH ──────────────────────────────────────────────
router.post('/auth/login',            authCtrl.login);
router.get ('/auth/me',               auth, authCtrl.me);
router.put ('/auth/change-password',  auth, authCtrl.changePassword);
router.get ('/auth/users',            auth, requireAdmin, authCtrl.listUsers);
router.post('/auth/users',            auth, requireAdmin, authCtrl.createUser);
// Upload avatar — multer dipakai langsung dari authCtrl
router.put ('/auth/avatar',           auth, authCtrl.uploadAvatar.single('avatar'), authCtrl.handleUploadAvatar);
router.delete('/auth/avatar', auth, authCtrl.deleteAvatar);

// ── DASHBOARD ─────────────────────────────────────────
router.get('/dashboard', auth, requireBidanOrAdmin, dashCtrl.dashboard);

// ── DATA ANAK ─────────────────────────────────────────
router.get   ('/anak',                   auth, requireBidanOrAdmin, anakCtrl.listAnak);
router.get   ('/anak/:id',               auth, requireBidanOrAdmin, anakCtrl.getAnak);
router.post  ('/anak',                   auth, requireBidanOrAdmin, anakCtrl.createAnak);
router.put   ('/anak/:id',               auth, requireBidanOrAdmin, anakCtrl.updateAnak);
router.delete('/anak/:id',               auth, requireBidanOrAdmin, anakCtrl.deleteAnak);
router.post  ('/anak/:id/pemeriksaan',   auth, requireBidanOrAdmin, anakCtrl.createPemeriksaan);
router.get   ('/anak/:id/grafik',        auth, requireBidanOrAdmin, anakCtrl.grafikPertumbuhan);

// ── PEMERIKSAAN (edit & delete) ───────────────────────
router.put   ('/pemeriksaan/:id',        auth, requireBidanOrAdmin, anakCtrl.updatePemeriksaan);
router.delete('/pemeriksaan/:id',        auth, requireBidanOrAdmin, anakCtrl.deletePemeriksaan);

// ── DATA IBU ──────────────────────────────────────────
router.get('/ibu',       auth, requireBidanOrAdmin, ibuCtrl.listIbu);
router.get('/ibu/:id',   auth, requireBidanOrAdmin, ibuCtrl.getIbu);
router.put('/ibu/:id',   auth, requireBidanOrAdmin, ibuCtrl.updateIbu);

// ── IMUNISASI ─────────────────────────────────────────
router.get   ('/imunisasi',             auth, requireBidanOrAdmin, imuCtrl.listImunisasi);
router.post  ('/imunisasi',             auth, requireBidanOrAdmin, imuCtrl.createImunisasi);
router.patch ('/imunisasi/:id/status',  auth, requireBidanOrAdmin, imuCtrl.updateStatus);
router.put   ('/imunisasi/:id/selesai', auth, requireBidanOrAdmin, imuCtrl.updateStatus);
router.delete('/imunisasi/:id',         auth, requireBidanOrAdmin, imuCtrl.deleteImunisasi);

// ── LAPORAN ───────────────────────────────────────────
router.get ('/laporan/rekap-bulanan',   auth, requireBidanOrAdmin, laporanCtrl.rekapBulanan);
router.post('/laporan/simpan',          auth, requireBidanOrAdmin, laporanCtrl.simpanLaporan);

module.exports = router;