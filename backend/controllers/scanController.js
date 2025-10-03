const qrModel = require("../models/qrModel");
const kehadiranModel = require("../models/kehadiranModel");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment-timezone");

exports.scanQR = (req, res) => {
  try {
    const body = req.body || {};
    let { qr_code_id, nisn, nama, kelas } = body;

  console.log("--- SCAN QR DITERIMA ---");
  console.log("ID QR Code dari Frontend:", qr_code_id);

    if (!req.body) {
      return res.status(400).json({ error: "Body request kosong atau Content-Type tidak didukung. Pastikan mengirim JSON (application/json)." });
    }

    // Normalisasi dan ekstraksi qr_code_id dari berbagai format
    const tryExtractQrId = (raw) => {
      if (!raw || typeof raw !== "string") return null;
      const trimmed = raw.trim();
      // Jika JSON string yang berisi qr_code_id
      if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("%7B") && trimmed.endsWith("%7D"))) {
        try {
          const decoded = decodeURIComponent(trimmed);
          const obj = JSON.parse(decoded);
          if (obj.qr_code_id) return String(obj.qr_code_id).trim();
        } catch (_) {}
      }
      // Jika URL lengkap, ambil UUID v4 di dalamnya
      const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
      const match = trimmed.match(uuidRegex);
      if (match) return match[0];
      // Jika hanya UUID murni (atau string apapun), kembalikan apa adanya
      return trimmed;
    };

    qr_code_id = tryExtractQrId(qr_code_id);

    if (!qr_code_id || !nisn || !nama || !kelas) {
      return res.status(400).json({ error: "Data tidak lengkap (qr_code_id/nisn/nama/kelas)" });
    }

  qrModel.getQRById(qr_code_id, (err, qrData) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!qrData)
      return res.status(400).json({ error: "QR Code tidak ditemukan" });

    // Waktu sekarang WIB
    const nowWIB = moment().tz("Asia/Jakarta");
    const todayWIB = nowWIB.format("YYYY-MM-DD");

    // Format tanggal dari DB ke YYYY-MM-DD dengan zona WIB
    const qrDateWIB = moment(qrData.tanggal)
      .tz("Asia/Jakarta")
      .format("YYYY-MM-DD");

    console.log("=== Debug Scan QR ===");
    console.log("qrData.tanggal (DB):", qrData.tanggal);
    console.log("qrDateWIB (Formatted):", qrDateWIB);
    console.log("today (system WIB):", todayWIB);
    console.log("qrData.expired (DB WIB):", qrData.expired);
    console.log("=======================");

    // Cek tanggal
    if (qrDateWIB !== todayWIB) {
      return res.status(400).json({
        status: "invalid",
        message: "QR tidak berlaku untuk tanggal ini",
      });
    }

    // Cek expired dengan zona WIB
    const expiredWIB = moment(qrData.expired).tz("Asia/Jakarta");
    if (expiredWIB.isBefore(nowWIB)) {
      return res.status(400).json({
        status: "invalid",
        message: "QR sudah kedaluwarsa",
      });
    }

    // Cek jam pelajaran
    const parseTimeFlexible = (dateStr, timeStr) => {
      // dukung HH:mm atau HH:mm:ss tanpa argumen strict yang salah posisi
      const base = `${dateStr} ${timeStr}`;
      return moment.tz(base, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss"], "Asia/Jakarta");
    };

    let jamMulai = parseTimeFlexible(todayWIB, qrData.jam_awal);
    let jamSelesai = parseTimeFlexible(todayWIB, qrData.jam_akhir);
    if (!jamMulai.isValid() || !jamSelesai.isValid()) {
      return res.status(400).json({
        status: "invalid",
        message: "Format jam_awal/jam_akhir tidak valid",
      });
    }
    if (jamSelesai.isBefore(jamMulai)) jamSelesai.add(1, "day");

    if (nowWIB.isBefore(jamMulai) || nowWIB.isAfter(jamSelesai)) {
      return res.status(400).json({
        status: "invalid",
        message: "QR tidak berlaku di jam ini",
      });
    }

    // Cek apakah siswa sudah absen
    kehadiranModel.checkAttendance(nisn, todayWIB, qrData.mapel, (err, exists) => {
      if (err) return res.status(500).json({ error: err.message });
      if (exists)
        return res
          .status(400)
          .json({ message: "Siswa sudah absen di sesi ini" });

      const selisihMenit = nowWIB.diff(jamMulai, "minutes");
      const status = selisihMenit > 10 ? "terlambat" : "hadir";

      const attendance = {
        id: uuidv4(),
        nisn,
        nama,
        kelas,
        mapel: qrData.mapel,
        minggu_ke: nowWIB.isoWeek(),
        tanggal: todayWIB,
        jam_scan: nowWIB.format("HH:mm:ss"),
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
  } catch (e) {
    console.error("SCAN QR ERROR:", e);
    return res.status(500).json({ error: "Terjadi kesalahan saat memproses QR" });
  }
};
