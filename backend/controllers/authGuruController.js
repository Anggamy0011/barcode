const guruModel = require('../models/guruModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.registerGuru = async (req, res) => {
  const { nidn, username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    guruModel.registerGuru(nidn, username, hashedPassword, (err, result) => {
      if (err) return res.status(500).json({ error: 'Register gagal' });
      res.status(201).json({ message: 'Guru berhasil register' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.loginGuru = (req, res) => {
  const { nidn, password } = req.body; // GANTI username menjadi nidn

  guruModel.getGuruByNidn(nidn, async (err, results) => { // PASTIKAN PARAMETERNYA JUGA nidn
    if (err || results.length === 0) {
      return res.status(401).json({ error: 'User tidak ditemukan' });
    }

    const guru = results[0];
    const match = await bcrypt.compare(password, guru.password);
    if (!match) return res.status(401).json({ error: 'Password salah' });

    const token = jwt.sign(
      { role: 'guru', nidn: guru.nidn },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      role: 'guru',
      user: {
        nidn: guru.nidn,
        username: guru.username,
      },
    });
  });
};
