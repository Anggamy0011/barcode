// models/qrModel.js
const db = require('../config/configDB');

const insertQRData = (
  qr_code_id,
  nidn,
  nama,
  kelas,
  mapel,
  hari,
  minggu_ke,
  jam_awal,
  jam_akhir,
  expired,
  callback
) => {
  const query = `
    INSERT INTO qr_codes (
      qr_code_id, nidn, nama, kelas, mapel, hari,
      minggu_ke, jam_awal, jam_akhir, expired, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    query,
    [qr_code_id, nidn, nama, kelas, mapel, hari, minggu_ke, jam_awal, jam_akhir, expired],
    callback
  );
};

const getQRById = (qr_code_id, callback) => {
  const query = "SELECT * FROM qr_codes WHERE qr_code_id = ?";
  db.query(query, [qr_code_id], (err, results) => {
    if (err) return callback(err, null);
    if (results.length === 0) return callback(null, null);
    callback(null, results[0]);
  });
};

module.exports = {
  insertQRData,
  getQRById
};