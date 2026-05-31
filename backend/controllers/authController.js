const jwt = require('jsonwebtoken');
const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/password');
const { removeAvatarFileData, saveAvatarFile } = require('../utils/avatarFileStore');

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
    const [rows] = await pool.query(
      `SELECT p.id, p.nama, p.email, p.role, p.no_hp,
              i.id AS ibu_id, i.nik, i.alamat, i.tanggal_lahir AS tanggal_lahir_ibu, i.ava_pict,
              b.id AS bidan_id, b.nomor_str, b.tempat_kerja
       FROM pengguna p
       LEFT JOIN ibu i ON i.pengguna_id = p.id
       LEFT JOIN bidan b ON b.pengguna_id = p.id
       WHERE p.id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    return res.json(withAvatarUrl(rows[0], req));
  } catch (error) {
    return next(error);
  }
}

async function updateAvatar(req, res, next) {
  try {
    if (req.user.role !== 'ibu' || !req.user.ibuId) {
      if (req.file) {
        await removeAvatarFile(`/uploads/profile/${req.file.filename}`);
      }
      return res.status(403).json({ message: 'Foto profil hanya tersedia untuk pengguna ibu' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File ava_pict wajib diunggah' });
    }

    const avatarPath = `/uploads/profile/${req.file.filename}`;
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
    if (req.file) {
      await removeAvatarFile(`/uploads/profile/${req.file.filename}`);
    }
    return next(error);
  }
}

module.exports = { login, me, register, updateAvatar };
