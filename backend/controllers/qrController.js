// controllers/qrController.js
const { insertQRData } = require('../models/qrModel');
const QRCode = require('qrcode');

exports.generateQR = async (req, res) => {
  try {
    const {
      qr_code_id,
      nidn,
      nama,
      kelas,
      mapel,
      hari,
      minggu_ke,
      jam_awal,
      jam_akhir,
      expired,
    } = req.body;

    // Validasi lengkap
    if (
      !qr_code_id || !nidn || !nama || !kelas || !mapel ||
      !hari || !minggu_ke || !jam_awal || !jam_akhir || !expired
    ) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    // Data untuk QR Code (JSON yang nanti bisa dibaca saat scan)
    const qrContent = JSON.stringify({
      qr_code_id,
    });

    // Simpan ke database (panggil model lama)
    insertQRData(
      qr_code_id,
      nidn,
      nama,
      kelas,
      mapel,
      hari,
      minggu_ke,
      jam_awal,
      jam_akhir,
      expired,
      async (err, result) => {
        if (err) {
          console.error('DB Error:', err);
          return res.status(500).json({ error: 'Gagal menyimpan QR ke database' });
        }

        try {
          const qrImage = await QRCode.toDataURL(qrContent);
          return res.status(201).json({
            message: 'QR code berhasil dibuat',
            qrImage,
            qrData: JSON.parse(qrContent),
          });
        } catch (qrError) {
          console.error('QR Generation Error:', qrError);
          return res.status(500).json({ error: 'Gagal membuat QR code' });
        }
      }
    );
  } catch (e) {
    console.error('Unexpected Error:', e);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};
