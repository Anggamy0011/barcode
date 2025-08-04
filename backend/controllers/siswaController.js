const { getAllSiswaFromDB } = require("../models/siswaModel");

const getAllSiswa = (req, res) => {
  getAllSiswaFromDB((err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
};

module.exports = { getAllSiswa };
