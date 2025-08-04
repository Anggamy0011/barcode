const QRCode = require("qrcode");

// Fungsi untuk generate QR Code sebagai Base64
exports.generateQRCodeBase64 = async (data) => {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 2,
      width: 300
    });
  } catch (err) {
    throw err;
  }
};
