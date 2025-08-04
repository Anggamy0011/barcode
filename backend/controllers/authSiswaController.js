const siswaModel = require('../models/siswaModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerSiswa = async (req, res) => {
  const { nisn, nama, kelas, jenis_kelamin, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    siswaModel.registerSiswa(nisn, nama, jenis_kelamin, kelas, hashedPassword, (err, result) => {
      if (err) {
        console.error('Register gagal:', err);
        return res.status(500).json({ error: 'Register gagal' });
      }
      res.status(201).json({ message: 'Siswa berhasil register' });
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.loginSiswa = (req, res) => {
  const { nisn, password } = req.body;

  siswaModel.getSiswaByNisn(nisn, async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: 'User tidak ditemukan' });
    }

    const siswa = results[0];

    const match = await bcrypt.compare(password, siswa.password);
    if (!match) {
      return res.status(401).json({ error: 'Password salah' });
    }

    const token = jwt.sign(
      { role: 'siswa', nisn: siswa.nisn },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ Kirimkan data lengkap user ke frontend
    res.json({
      message: 'Login berhasil',
      user: {
        nama: siswa.nama,
        nisn: siswa.nisn,
        kelas: siswa.kelas,
        jenis_kelamin: siswa.jenis_kelamin
      },
      token,
      role: 'siswa'
    });
  });
};