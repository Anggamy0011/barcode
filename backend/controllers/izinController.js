const { v4: uuidv4 } = require("uuid");
const moment = require("moment-timezone");
const izinModel = require("../models/izinModel");

exports.createIzin = (req, res) => {
  try {
    const { nisn, nama, kelas, alasan, tanggal } = req.body || {};
    const bukti = req.file; // optional

    if (!nisn || !nama || !kelas || !alasan) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const tanggalWIB = tanggal
      ? moment(tanggal).tz("Asia/Jakarta").format("YYYY-MM-DD")
      : moment().tz("Asia/Jakarta").format("YYYY-MM-DD");

    const izin = {
      id: uuidv4(),
      nisn,
      nama,
      kelas,
      tanggal: tanggalWIB,
      alasan,
      bukti_path: bukti ? `/uploads/izin/${bukti.filename}` : null,
      status: 'pending',
    };

    // Cegah duplikasi pengajuan izin di hari yang sama untuk nisn yang sama
    izinModel.existsByNisnTanggal(nisn, tanggalWIB, (errExist, exists) => {
      if (errExist) return res.status(500).json({ error: "DB error" });
      if (exists) return res.status(400).json({ error: "Sudah ada pengajuan izin di tanggal ini" });

      izinModel.addIzin(izin, (err) => {
        if (err) return res.status(500).json({ error: "Gagal menyimpan data izin" });
        res.status(201).json({ status: "success", data: izin });
      });
    });
  } catch (e) {
    return res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};

exports.checkIzin = (req, res) => {
  const { nisn, tanggal } = req.query;
  if (!nisn) return res.status(400).json({ error: "nisn wajib" });
  const tanggalWIB = tanggal
    ? moment(tanggal).tz("Asia/Jakarta").format("YYYY-MM-DD")
    : moment().tz("Asia/Jakarta").format("YYYY-MM-DD");

  izinModel.hasApprovedIzin(nisn, tanggalWIB, (err, has) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ nisn, tanggal: tanggalWIB, hasIzin: has });
  });
};

exports.listPending = (req, res) => {
  const { kelas } = req.query;
  izinModel.getPendingTodayByKelas(kelas || null, (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
};

exports.approval = (req, res) => {
  const { id, action } = req.body || {};
  if (!id || !action) return res.status(400).json({ error: "id/action wajib" });
  const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : null;
  if (!status) return res.status(400).json({ error: "action harus approve/reject" });
  izinModel.updateStatus(id, status, (err) => {
    if (err) return res.status(500).json({ error: "Gagal update status" });
    res.json({ status: 'success', id, newStatus: status });
  });
};

// Ambil semua izin HARI INI (semua status), opsional filter per kelas
exports.listToday = (req, res) => {
  const { kelas } = req.query;
  izinModel.getTodayByKelas(kelas || null, (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
};


