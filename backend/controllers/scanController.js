const qrModel = require("../models/qrModel");
const kehadiranModel = require("../models/kehadiranModel");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment-timezone");

exports.scanQR = (req, res) => {
  const { qr_code_id, nisn, nama, kelas } = req.body;

  if (!qr_code_id || !nisn || !nama || !kelas) {
    return res.status(400).json({ error: "Data tidak lengkap" });
  }

  qrModel.getQRById(qr_code_id, (err, qrData) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!qrData)
      return res.status(400).json({ error: "QR Code tidak ditemukan" });

    // Waktu sekarang WIB
    const moment = require("moment-timezone");
    const nowWIB = moment().tz("Asia/Jakarta");
    const todayWIB = nowWIB.format("YYYY-MM-DD");

    console.log("=== Debug Scan QR ===");
    console.log("qrData.tanggal (DB):", qrData.tanggal);
    console.log("today (system WIB):", today);
    console.log("qrData.expired (DB WIB):", qrData.expired);
    console.log("======================");

    // Cek tanggal
    if (qrData.tanggal !== todayWIB) {
      return res.status(400).json({
        status: "invalid",
        message: "QR tidak berlaku untuk tanggal ini",
      });
    }

    // Cek expired
    if (moment(qrData.expired).isBefore(nowWIB)) {
      return res.status(400).json({
        status: "invalid",
        message: "QR sudah kedaluwarsa",
      });
    }

    // Cek jam pelajaran
    let jamMulai = moment.tz(
      `${todayWIB} ${qrData.jam_awal}`,
      "YYYY-MM-DD HH:mm",
      "Asia/Jakarta"
    );
    let jamSelesai = moment.tz(
      `${todayWIB} ${qrData.jam_akhir}`,
      "YYYY-MM-DD HH:mm",
      "Asia/Jakarta"
    );
    if (jamSelesai.isBefore(jamMulai)) jamSelesai.add(1, "day");

    if (nowWIB.isBefore(jamMulai) || nowWIB.isAfter(jamSelesai)) {
      return res.status(400).json({
        status: "invalid",
        message: "QR tidak berlaku di jam ini",
      });
    }

    // Cek apakah siswa sudah absen
    kehadiranModel.checkAttendance(nisn, today, qrData.mapel, (err, exists) => {
      if (err) return res.status(500).json({ error: err.message });
      if (exists)
        return res
          .status(400)
          .json({ message: "Siswa sudah absen di sesi ini" });

      const selisihMenit = now.diff(jamMulai, "minutes");
      const status = selisihMenit > 10 ? "terlambat" : "hadir";

      const attendance = {
        id: uuidv4(),
        nisn,
        nama,
        kelas,
        mapel: qrData.mapel,
        tanggal: today,
        jam_scan: now.format("HH:mm:ss"),
        status,
        qr_code_id,
      };

      kehadiranModel.addAttendance(attendance, (err2) => {
        if (err2)
          return res.status(500).json({ error: "Gagal menyimpan absensi" });
        res.json({
          status: "success",
          message: `Siswa ${nama} tercatat sebagai ${status}`,
          data: attendance,
        });
      });
    });
  });
};
