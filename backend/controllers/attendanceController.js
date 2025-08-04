const attendanceModel = require('../models/attendanceModel');

exports.getRekapByKelas = (req, res) => {
  const { kelas } = req.params;

  attendanceModel.getRekapByKelas(kelas, (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ kelas, rekap: results });
  });
};

exports.getRiwayatByNISN = (req, res) => {
  const { nisn } = req.params;

  attendanceModel.getRiwayatByNISN(nisn, (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ nisn, riwayat: results });
  });
};