require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const pool = require('./config/db');
const { serveUploadedFile } = require('./utils/avatarFileStore');

const authRoutes = require('./routes/authRoutes');
const anakRoutes = require('./routes/anakRoutes');
const imunisasiRoutes = require('./routes/imunisasiRoutes');
const pemeriksaanRoutes = require('./routes/pemeriksaanRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const port = Number(process.env.PORT || 8080);

app.set('trust proxy', true);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors());
app.use(express.json());
app.use('/uploads', serveUploadedFile, express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Telemedicine Posyandu API aktif' });
});

app.get('/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/anak', anakRoutes);
app.use('/api/imunisasi', imunisasiRoutes);
app.use('/api/pemeriksaan', pemeriksaanRoutes);
app.use('/api/immunizations', imunisasiRoutes);
app.use('/api/examinations', pemeriksaanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

app.use((error, req, res, next) => {
  console.error(error);
  const status = error.name === 'MulterError' ? 400 : error.status || 500;

  res.status(status).json({
    message: error.message || 'Terjadi kesalahan pada server',
  });
});

app.listen(port, '0.0.0.0', () => { //cloud runnya ke 0.0.0.0
  console.log(`Telemedicine Posyandu API running on port ${port}`);
});
