const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const { Storage } = require('@google-cloud/storage');

const gcs = new Storage();
const bucket = gcs.bucket(process.env.GCS_BUCKET_NAME);

function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, ibuId: user.ibu_id || null, bidanId: user.bidan_id || null },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  );
}

// ── Multer config untuk upload avatar (pakai memory, bukan disk) ──
const avatarFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Format file tidak didukung. Gunakan JPG atau PNG.'));
};

const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: avatarFilter,
});

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });

    const [rows] = await pool.query(
      `SELECT p.id, p.nama, p.email, p.password, p.role, p.no_hp, p.avatar,
              i.id AS ibu_id,
              b.id AS bidan_id, b.nomor_str, b.tempat_kerja
       FROM pengguna p
       LEFT JOIN ibu i ON i.pengguna_id = p.id
       LEFT JOIN bidan b ON b.pengguna_id = p.id
       WHERE p.email = ? LIMIT 1`,
      [email]
    );

    const user = rows[0];
    if (!user) return res.status(401).json({ success: false, message: 'Email atau password salah.' });

    if (!['admin', 'bidan'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Gunakan aplikasi mobile.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Email atau password salah.' });

    const token = createToken(user);
    delete user.password;

    return res.json({
      success: true,
      message: 'Login berhasil.',
      data: { token, user },
    });
  } catch (err) { return next(err); }
}

// GET /api/auth/me
async function me(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.nama, p.email, p.role, p.no_hp, p.avatar,
              b.id AS bidan_id, b.nomor_str, b.tempat_kerja
       FROM pengguna p
       LEFT JOIN bidan b ON b.pengguna_id = p.id
       WHERE p.id = ? LIMIT 1`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) { return next(err); }
}

// PUT /api/auth/profile — update nama & no_hp
async function updateProfile(req, res, next) {
  try {
    const { nama, no_hp } = req.body;
    if (!nama) return res.status(400).json({ success: false, message: 'Nama tidak boleh kosong.' });

    await pool.query(
      'UPDATE pengguna SET nama = ?, no_hp = ? WHERE id = ?',
      [nama, no_hp || null, req.user.id]
    );

    return res.json({ success: true, message: 'Profil berhasil diperbarui.' });
  } catch (err) { return next(err); }
}

// PUT /api/auth/change-password
async function changePassword(req, res, next) {
  try {
    const { password_lama, password_baru } = req.body;
    if (!password_lama || !password_baru)
      return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi.' });
    if (password_baru.length < 6)
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });

    const [rows] = await pool.query('SELECT password FROM pengguna WHERE id = ?', [req.user.id]);
    const valid = await bcrypt.compare(password_lama, rows[0].password);
    if (!valid) return res.status(400).json({ success: false, message: 'Password lama salah.' });

    await pool.query('UPDATE pengguna SET password = ? WHERE id = ?', [await bcrypt.hash(password_baru, 10), req.user.id]);
    return res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (err) { return next(err); }
}

// PUT /api/auth/avatar — upload foto profil ke GCS
async function handleUploadAvatar(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File tidak ditemukan.' });

    const filename = `avatar_${req.user.id}_${Date.now()}${path.extname(req.file.originalname)}`;
    const blob = bucket.file(filename);

    // Upload ke GCS — tanpa predefinedAcl agar kompatibel dengan uniform bucket-level access
    await blob.save(req.file.buffer, {
      contentType: req.file.mimetype,
    });

    const avatarUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filename}`;

    // Hapus avatar lama dari GCS jika ada
    const [rows] = await pool.query('SELECT avatar FROM pengguna WHERE id = ?', [req.user.id]);
    const oldAvatar = rows[0]?.avatar;
    if (oldAvatar && oldAvatar.includes('storage.googleapis.com')) {
      const oldFilename = oldAvatar.split('/').pop();
      await bucket.file(oldFilename).delete().catch(() => {});
    }

    await pool.query('UPDATE pengguna SET avatar = ? WHERE id = ?', [avatarUrl, req.user.id]);
    return res.json({ success: true, avatar: avatarUrl });
  } catch (err) { return next(err); }
}

// DELETE /api/auth/avatar — hapus foto profil dari GCS
async function deleteAvatar(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT avatar FROM pengguna WHERE id = ?', [req.user.id]);
    const oldAvatar = rows[0]?.avatar;
    if (oldAvatar && oldAvatar.includes('storage.googleapis.com')) {
      const oldFilename = oldAvatar.split('/').pop();
      await bucket.file(oldFilename).delete().catch(() => {});
    }
    await pool.query('UPDATE pengguna SET avatar = NULL WHERE id = ?', [req.user.id]);
    return res.json({ success: true, message: 'Foto profil berhasil dihapus.' });
  } catch (err) { return next(err); }
}

// GET /api/auth/users (admin only)
async function listUsers(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.nama, p.email, p.role, p.no_hp,
              b.nomor_str, b.tempat_kerja
       FROM pengguna p
       LEFT JOIN bidan b ON b.pengguna_id = p.id
       ORDER BY p.id DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) { return next(err); }
}

// POST /api/auth/users (admin only - tambah bidan)
async function createUser(req, res, next) {
  try {
    const { nama, email, password, role, no_hp, nomor_str, tempat_kerja } = req.body;
    if (!nama || !email || !password)
      return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.' });

    const [existing] = await pool.query('SELECT id FROM pengguna WHERE email = ?', [email]);
    if (existing.length) return res.status(400).json({ success: false, message: 'Email sudah terdaftar.' });

    const [result] = await pool.query(
      'INSERT INTO pengguna (nama, email, password, role, no_hp) VALUES (?, ?, ?, ?, ?)',
      [nama, email, await bcrypt.hash(password, 10), role || 'bidan', no_hp || null]
    );

    if ((role || 'bidan') === 'bidan') {
      await pool.query('INSERT INTO bidan (pengguna_id, nomor_str, tempat_kerja) VALUES (?, ?, ?)',
        [result.insertId, nomor_str || null, tempat_kerja || null]);
    }

    return res.status(201).json({ success: true, message: 'User berhasil dibuat.', data: { id: result.insertId, nama, email, role: role || 'bidan' } });
  } catch (err) { return next(err); }
}

module.exports = { login, me, updateProfile, changePassword, listUsers, createUser, uploadAvatar, handleUploadAvatar, deleteAvatar };