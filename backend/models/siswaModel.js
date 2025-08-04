const db = require('../config/configDB');

exports.registerSiswa = (nisn, nama,jenis_kelamin, kelas, password, callback) => {
  const query = 'INSERT INTO siswa (nisn, nama,jenis_kelamin, kelas, password) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [nisn, nama,jenis_kelamin, kelas, password], callback);
};

exports.getSiswaByNisn = (nisn, callback) => {
  const query = 'SELECT * FROM siswa WHERE nisn = ?';
  db.query(query, [nisn], callback);
};


exports.getAllSiswaFromDB = (callback) => {
  const query = "SELECT id,nisn, nama, kelas FROM siswa";
  db.query(query, callback);
};


