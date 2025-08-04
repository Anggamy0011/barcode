const db = require('../config/configDB');


exports.registerGuru = (nidn, username, password, callback) => {
  const query = 'INSERT INTO guru (nidn, username, password) VALUES (?, ?, ?)';
  db.query(query, [nidn, username, password], callback);
};

exports.getGuruByNidn = (nidn, callback) => {
  const query = 'SELECT * FROM guru WHERE nidn = ?';
  db.query(query, [nidn], callback);
};

