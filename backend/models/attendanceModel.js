const db = require('../config/configDB');

exports.getRekapByKelas = (kelas, callback) => {
  const query = `
    SELECT s.nama, s.nisn, a.tanggal, a.status
    FROM kehadiran a
    JOIN siswa s ON a.nisn = s.nisn
    WHERE s.kelas = ?
    ORDER BY s.nama, a.tanggal
  `;

  db.query(query, [kelas], callback);
};

exports.getRiwayatByNISN = (nisn, callback) => {
  const query = `
    SELECT tanggal, status
    FROM kehadiran
    WHERE nisn = ?
    ORDER BY tanggal DESC
  `;

  db.query(query, [nisn], callback);
};
