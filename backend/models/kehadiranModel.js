// models/kehadiranModel.js
const db = require("../config/configDB");

// Simpan absensi baru
exports.addAttendance = (attendance, callback) => {
  const query = `
    INSERT INTO kehadiran (
      id, nisn, nama, kelas, mapel, minggu_ke,
      tanggal, jam_scan, status, qr_code_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      attendance.id,
      attendance.nisn,
      attendance.nama,
      attendance.kelas,
      attendance.mapel,
      attendance.minggu_ke,
      attendance.tanggal,
      attendance.jam_scan,
      attendance.status,
      attendance.qr_code_id,
    ],
    callback
  );
};

// Cek apakah siswa sudah absen di sesi ini
exports.checkAttendance = (nisn, tanggal, mapel, callback) => {
  const query = `
    SELECT COUNT(*) AS count
    FROM kehadiran
    WHERE nisn = ? AND tanggal = ? AND mapel = ?
  `;
  db.query(query, [nisn, tanggal, mapel], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results[0].count > 0);
  });
};
