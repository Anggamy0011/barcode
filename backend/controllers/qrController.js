const { v4: uuidv4 } = require("uuid");
const { insertQRData, getAllQR } = require("../models/qrModel");

exports.generateQR = (req, res) => {
  try {
    const { nidn, nama, kelas, mapel, tanggal, jam_awal, jam_akhir } = req.body;

    if (
      !nidn ||
      !nama ||
      !kelas ||
      !mapel ||
      !tanggal ||
      !jam_awal ||
      !jam_akhir
    ) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const moment = require("moment-timezone");

    const qr_code_id = uuidv4();

    // Simpan tanggal sesuai WIB
    const tanggalWIB = moment(tanggal).tz("Asia/Jakarta").format("YYYY-MM-DD");

    // Expired 1 jam dari sekarang, WIB
    const expiredWIB = moment()
      .tz("Asia/Jakarta")
      .add(1, "hour")
      .format("YYYY-MM-DD HH:mm:ss");

    insertQRData(
      qr_code_id,
      nidn,
      nama,
      kelas,
      mapel,
      tanggalWIB,
      jam_awal,
      jam_akhir,
      expiredWIB,
      (err) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ error: "Gagal simpan ke database" });
        }

        res.status(201).json({
          message: "QR code berhasil dibuat",
          qrData: { qr_code_id },
        });
      }
    );
  } catch (e) {
    console.error("Unexpected Error:", e);
    return res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};

exports.getAllQRData = (req, res) => {
  getAllQR((err, data) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: "Gagal mengambil data QR dari database" });
    }
    res.json(data);
  });
};
