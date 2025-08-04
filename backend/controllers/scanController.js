const { v4: uuidv4 } = require("uuid");
const attendanceStore = require("../models/attendanceStore");
const qrModel = require("../models/qrModel");
// const qrStore = require("../models/qrStore");

exports.scanQR = (req, res) => {
  const { qr_code_id, nisn, nama, kelas } = req.body;

  if (!qr_code_id || !nisn || !nama || !kelas) {
    return res.status(400).json({ error: "Data tidak lengkap" });
  }

  qrModel.getQRById(qr_code_id, (err, qrData) => {
    if (err) {
      return res.status(500).json({ error: "Database error", detail: err.message });
    }

    if (!qrData) {
      return res.status(400).json({ error: "QR Code tidak ditemukan" });
    }

    try {
      const now = new Date();
      const hariSekarang = now.toLocaleDateString("id-ID", { weekday: "long" });
      const mingguKeSekarang = Math.ceil(now.getDate() / 7);
      const today = now.toISOString().split("T")[0];
      const jamMulai = new Date(`${today}T${qrData.jam_awal}:00`);
      const jamSelesai = new Date(`${today}T${qrData.jam_akhir}:00`);

    console.log("qrData.hari:", qrData.hari);
    console.log("hariSekarang:", hariSekarang);
    console.log("qrData.minggu_ke:", qrData.minggu_ke);

      if (
        qrData.hari.toLowerCase() !== hariSekarang.toLowerCase() ||
        parseInt(qrData.minggu_ke) !== mingguKeSekarang
      ) {
        return res.status(400).json({
          status: "invalid",
          message: "QR tidak berlaku untuk hari/minggu ini",
        });
      }

      if (now < jamMulai || now > jamSelesai) {
        return res.status(400).json({
          status: "invalid",
          message: "QR tidak berlaku di jam ini",
        });
      }

      if (attendanceStore.hasScanned(nisn, today, qrData.mapel)) {
        return res.status(400).json({ message: "Siswa sudah scan absensi untuk sesi ini" });
      }

      const selisihMenit = Math.floor((now - jamMulai) / 60000);
      const status = selisihMenit > 10 ? "terlambat" : "hadir";

      const attendance = {
        id: uuidv4(),
        nisn,
        nama,
        kelas,
        mapel: qrData.mapel,
        minggu_ke: mingguKeSekarang,
        tanggal: today,
        jam_scan: now.toLocaleTimeString("id-ID"),
        status,
        qr_code_id,
      };

      attendanceStore.addAttendance(attendance);

      res.json({
        message: `Siswa ${nama} tercatat sebagai ${status}`,
        status,
        data: attendance,
      });
    } catch (err) {
      res.status(500).json({ error: "Terjadi kesalahan", detail: err.message });
    }
  });
};
