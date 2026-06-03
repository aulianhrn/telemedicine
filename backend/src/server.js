require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');
const pool    = require('./config/db');
const routes  = require('./routes');

const app  = express();
const PORT = process.env.PORT || 8000;

// ── MIDDLEWARE ────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: 'https://telemedicine-fe-dot-praktikum-tcc01.uc.r.appspot.com',
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── ROUTES ────────────────────────────────────────────
app.use('/api', routes);

// Health check
app.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, message: '🏥 Posyandu Web API - Running!', db: 'Connected ✅' });
  } catch {
    res.json({ success: true, message: '🏥 Posyandu Web API - Running!', db: 'Disconnected ❌' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} tidak ditemukan.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// ── START ─────────────────────────────────────────────
async function start() {
  // 1. Jalankan server DULU agar lolos pengecekan Cloud Run
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend Web berjalan di port ${PORT}`);
    console.log(`📋 Backend Mobile temenmu di port 8080`);
    console.log(`🗄️  Sharing database: ${process.env.DB_NAME}`);
  });

  // 2. Baru tes koneksi database (tanpa mematikan aplikasi jika gagal)
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database terhubung:', process.env.DB_NAME);
  } catch (err) {
    console.error('❌ Gagal koneksi database:', err.message);
    // process.exit(1); <--- Dihapus agar aplikasi tetap hidup meskipun DB bermasalah
  }
}

start();