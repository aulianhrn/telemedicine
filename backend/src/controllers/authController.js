const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/password');

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

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const [rows] = await pool.query(
      `SELECT p.id, p.nama, p.email, p.password, p.role, p.no_hp,
              i.id AS ibu_id, i.nik, i.alamat, i.tanggal_lahir AS tanggal_lahir_ibu,
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

    return res.json({ token, user });
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
      nomor_str: role === 'bidan' ? nomor_str || null : null,
      tempat_kerja: role === 'bidan' ? tempat_kerja || null : null,
    };

    return res.status(201).json({
      token: createToken(user),
      user,
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
              i.id AS ibu_id, i.nik, i.alamat, i.tanggal_lahir AS tanggal_lahir_ibu,
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

    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = { login, me, register };
