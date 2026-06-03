const jwt = require('jsonwebtoken');
const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/password');
const { removeAvatarFileData, saveAvatarFile } = require('../utils/avatarFileStore');
const { createAvatarPath } = require('../utils/cloudStorage');

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      ibuId: user.ibu_id,
      bidanId: user.bidan_id,
    },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  );
}

function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

function withAvatarUrl(user, req) {
  if (!user) {
    return user;
  }

  return {
    ...user,
    ava_pict_url: user.ava_pict ? `${getBaseUrl(req)}${user.ava_pict}` : null,
  };
}

function normalizeEmpty(value) {
  return value === '' ? null : value;
}

async function getUserProfile(userId) {
  const [rows] = await pool.query(
    `SELECT p.id, p.nama, p.email, p.role, p.no_hp,
            i.id AS ibu_id, i.nik, i.alamat, i.tanggal_lahir AS tanggal_lahir_ibu, i.ava_pict,
            b.id AS bidan_id, b.nomor_str, b.tempat_kerja
     FROM pengguna p
     LEFT JOIN ibu i ON i.pengguna_id = p.id
     LEFT JOIN bidan b ON b.pengguna_id = p.id
     WHERE p.id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function removeAvatarFile(avatarPath) {
  if (!avatarPath) {
    return;
  }

  const relativePath = avatarPath.replace(/^\/+/, '');
  const filePath = path.join(__dirname, '..', relativePath);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`Gagal menghapus file avatar lama: ${filePath}`, error.message);
    }
  }

  await removeAvatarFileData(avatarPath);
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const [rows] = await pool.query(
      `SELECT p.id, p.nama, p.email, p.password, p.role, p.no_hp,
              i.id AS ibu_id, i.nik, i.alamat, i.tanggal_lahir AS tanggal_lahir_ibu, i.ava_pict,
              b.id AS bidan_id, b.nomor_str, b.tempat_kerja
       FROM pengguna p
       LEFT JOIN ibu i ON i.pengguna_id = p.id
       LEFT JOIN bidan b ON b.pengguna_id = p.id
       WHERE p.email = ?
       LIMIT 1`,
      [email]
    );

    const user = rows[0];
    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const token = createToken(user);

    delete user.password;

    return res.json({ token, user: withAvatarUrl(user, req) });
  } catch (error) {
    return next(error);
  }
}

async function register(req, res, next) {
  let connection;

  try {
    connection = await pool.getConnection();

    const {
      nama,
      email,
      password,
      role = 'ibu',
      no_hp,
      nik,
      alamat,
      tanggal_lahir,
      nomor_str,
      tempat_kerja,
    } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }

    if (!['ibu', 'bidan'].includes(role)) {
      return res.status(400).json({ message: 'Role hanya boleh ibu atau bidan' });
    }

    if (role === 'ibu' && !nik) {
      return res.status(400).json({ message: 'NIK wajib diisi untuk pendaftaran ibu' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    await connection.beginTransaction();

    const [existingEmail] = await connection.query(
      'SELECT id FROM pengguna WHERE email = ? LIMIT 1',
      [email]
    );

    if (existingEmail.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    if (role === 'ibu') {
      const [existingNik] = await connection.query(
        'SELECT id FROM ibu WHERE nik = ? LIMIT 1',
        [nik]
      );

      if (existingNik.length > 0) {
        await connection.rollback();
        return res.status(409).json({ message: 'NIK sudah terdaftar' });
      }
    }

    const hashedPassword = await hashPassword(password);
    const [penggunaResult] = await connection.query(
      `INSERT INTO pengguna (nama, email, password, role, no_hp)
       VALUES (?, ?, ?, ?, ?)`,
      [nama, email, hashedPassword, role, no_hp || null]
    );

    const penggunaId = penggunaResult.insertId;
    let ibuId = null;
    let bidanId = null;

    if (role === 'ibu') {
      const [ibuResult] = await connection.query(
        `INSERT INTO ibu (pengguna_id, nik, alamat, tanggal_lahir)
         VALUES (?, ?, ?, ?)`,
        [penggunaId, nik, alamat || null, tanggal_lahir || null]
      );
      ibuId = ibuResult.insertId;
    }

    if (role === 'bidan') {
      const [bidanResult] = await connection.query(
        `INSERT INTO bidan (pengguna_id, nomor_str, tempat_kerja)
         VALUES (?, ?, ?)`,
        [penggunaId, nomor_str || null, tempat_kerja || null]
      );
      bidanId = bidanResult.insertId;
    }

    await connection.commit();

    const user = {
      id: penggunaId,
      nama,
      email,
      role,
      no_hp: no_hp || null,
      ibu_id: ibuId,
      bidan_id: bidanId,
      nik: role === 'ibu' ? nik : null,
      alamat: role === 'ibu' ? alamat || null : null,
      tanggal_lahir_ibu: role === 'ibu' ? tanggal_lahir || null : null,
      ava_pict: null,
      nomor_str: role === 'bidan' ? nomor_str || null : null,
      tempat_kerja: role === 'bidan' ? tempat_kerja || null : null,
    };

    return res.status(201).json({
      token: createToken(user),
      user: withAvatarUrl(user, req),
      message: 'Registrasi berhasil',
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    return next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function me(req, res, next) {
  try {
    const user = await getUserProfile(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    return res.json(withAvatarUrl(user, req));
  } catch (error) {
    return next(error);
  }
}

async function updateIbuProfile(req, res, next) {
  let connection;

  try {
    if (req.user.role !== 'ibu' || !req.user.ibuId) {
      return res.status(403).json({ message: 'Edit profil hanya tersedia untuk pengguna ibu' });
    }

    const allowedFields = ['nama', 'email', 'no_hp', 'nik', 'alamat', 'tanggal_lahir'];
    const hasUpdate = allowedFields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field));

    if (!hasUpdate) {
      return res.status(400).json({
        message: 'Minimal satu field profil wajib diisi',
        allowed_fields: allowedFields,
      });
    }

    const {
      nama,
      email,
      no_hp,
      nik,
      alamat,
      tanggal_lahir,
    } = req.body;

    if (Object.prototype.hasOwnProperty.call(req.body, 'nama') && !String(nama || '').trim()) {
      return res.status(400).json({ message: 'Nama tidak boleh kosong' });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'email') && !String(email || '').trim()) {
      return res.status(400).json({ message: 'Email tidak boleh kosong' });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'nik') && !String(nik || '').trim()) {
      return res.status(400).json({ message: 'NIK tidak boleh kosong' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    if (email) {
      const [existingEmail] = await connection.query(
        'SELECT id FROM pengguna WHERE email = ? AND id <> ? LIMIT 1',
        [String(email).trim(), req.user.id]
      );

      if (existingEmail.length > 0) {
        await connection.rollback();
        return res.status(409).json({ message: 'Email sudah terdaftar' });
      }
    }

    if (nik) {
      const [existingNik] = await connection.query(
        'SELECT id FROM ibu WHERE nik = ? AND id <> ? LIMIT 1',
        [String(nik).trim(), req.user.ibuId]
      );

      if (existingNik.length > 0) {
        await connection.rollback();
        return res.status(409).json({ message: 'NIK sudah terdaftar' });
      }
    }

    const penggunaUpdates = [];
    const penggunaParams = [];

    if (Object.prototype.hasOwnProperty.call(req.body, 'nama')) {
      penggunaUpdates.push('nama = ?');
      penggunaParams.push(String(nama).trim());
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'email')) {
      penggunaUpdates.push('email = ?');
      penggunaParams.push(String(email).trim());
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'no_hp')) {
      penggunaUpdates.push('no_hp = ?');
      penggunaParams.push(normalizeEmpty(no_hp));
    }

    if (penggunaUpdates.length > 0) {
      penggunaParams.push(req.user.id);
      await connection.query(
        `UPDATE pengguna SET ${penggunaUpdates.join(', ')} WHERE id = ?`,
        penggunaParams
      );
    }

    const ibuUpdates = [];
    const ibuParams = [];

    if (Object.prototype.hasOwnProperty.call(req.body, 'nik')) {
      ibuUpdates.push('nik = ?');
      ibuParams.push(String(nik).trim());
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'alamat')) {
      ibuUpdates.push('alamat = ?');
      ibuParams.push(normalizeEmpty(alamat));
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'tanggal_lahir')) {
      ibuUpdates.push('tanggal_lahir = ?');
      ibuParams.push(normalizeEmpty(tanggal_lahir));
    }

    if (ibuUpdates.length > 0) {
      ibuParams.push(req.user.ibuId);
      await connection.query(
        `UPDATE ibu SET ${ibuUpdates.join(', ')} WHERE id = ?`,
        ibuParams
      );
    }

    await connection.commit();

    const user = await getUserProfile(req.user.id);

    return res.json({
      message: 'Profil ibu berhasil diperbarui',
      user: withAvatarUrl(user, req),
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    return next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function updatePassword(req, res, next) {
  try {
    const { old_password, current_password, password_lama, new_password, password_baru } = req.body;
    const currentPassword = old_password || current_password || password_lama;
    const newPassword = new_password || password_baru;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Password lama dan password baru wajib diisi',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
    }

    const [rows] = await pool.query(
      'SELECT password FROM pengguna WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    const validPassword = await verifyPassword(currentPassword, rows[0].password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Password lama salah' });
    }

    const hashedPassword = await hashPassword(newPassword);

    await pool.query(
      'UPDATE pengguna SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    return res.json({ message: 'Password berhasil diperbarui' });
  } catch (error) {
    return next(error);
  }
}

async function updateAvatar(req, res, next) {
  let avatarPath = null;

  try {
    if (req.user.role !== 'ibu' || !req.user.ibuId) {
      return res.status(403).json({ message: 'Foto profil hanya tersedia untuk pengguna ibu' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File ava_pict wajib diunggah' });
    }

    avatarPath = createAvatarPath(req.file, 'profile');
    await saveAvatarFile(avatarPath, req.file);

    const [rows] = await pool.query(
      'SELECT ava_pict FROM ibu WHERE id = ? LIMIT 1',
      [req.user.ibuId]
    );

    if (!rows[0]) {
      await removeAvatarFile(avatarPath);
      return res.status(404).json({ message: 'Data ibu tidak ditemukan' });
    }

    await pool.query(
      'UPDATE ibu SET ava_pict = ? WHERE id = ?',
      [avatarPath, req.user.ibuId]
    );

    await removeAvatarFile(rows[0].ava_pict);

    return res.json({
      message: 'Foto profil berhasil diperbarui',
      ava_pict: avatarPath,
      ava_pict_url: `${getBaseUrl(req)}${avatarPath}`,
    });
  } catch (error) {
    if (avatarPath) {
      await removeAvatarFile(avatarPath);
    }
    return next(error);
  }
}

module.exports = { login, me, register, updateIbuProfile, updatePassword, updateAvatar };
