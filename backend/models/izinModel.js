const db = require("../config/configDB");

// Simpan permohonan izin siswa (status default: pending)
exports.addIzin = (izin, callback) => {
  const query = `
    INSERT INTO izin (
      id, nisn, nama, kelas, tanggal, alasan, bukti_path, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    query,
    [
      izin.id,
      izin.nisn,
      izin.nama,
      izin.kelas,
      izin.tanggal,
      izin.alasan,
      izin.bukti_path || null,
      izin.status || 'pending',
    ],
    callback
  );
};

// Cek ada izin apapun (status apapun) pada tanggal tertentu
exports.existsByNisnTanggal = (nisn, tanggal, callback) => {
  const query = `
    SELECT COUNT(*) AS count
    FROM izin
    WHERE nisn = ? AND tanggal = ?
  `;
  db.query(query, [nisn, tanggal], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results[0].count > 0);
  });
};

// Cek apakah siswa memiliki izin DISETUJUI pada tanggal tertentu
exports.hasApprovedIzin = (nisn, tanggal, callback) => {
  const query = `
    SELECT COUNT(*) AS count
    FROM izin
    WHERE nisn = ? AND tanggal = ? AND status = 'approved'
  `;
  db.query(query, [nisn, tanggal], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results[0].count > 0);
  });
};

exports.getPendingTodayByKelas = (kelas, callback) => {
  const query = `
    SELECT * FROM izin
    WHERE status = 'pending' AND tanggal = CURDATE() ${kelas ? 'AND kelas = ?' : ''}
    ORDER BY created_at DESC
  `;
  const params = kelas ? [kelas] : [];
  db.query(query, params, callback);
};

exports.getTodayByKelas = (kelas, callback) => {
  const query = `
    SELECT * FROM izin
    WHERE tanggal = CURDATE() ${kelas ? 'AND kelas = ?' : ''}
    ORDER BY created_at DESC
  `;
  const params = kelas ? [kelas] : [];
  db.query(query, params, callback);
};

exports.updateStatus = (id, status, callback) => {
  const query = `UPDATE izin SET status = ? WHERE id = ?`;
  db.query(query, [status, id], callback);
};


