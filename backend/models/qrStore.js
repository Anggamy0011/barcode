// models/qrStore.js
const qrDataList = [];

module.exports = {
  // Tambahkan QR baru
  addQR: (data) => {
    qrDataList.push(data);
  },

  // Ambil QR berdasarkan ID
  getQRById: (id) => {
    return qrDataList.find((qr) => qr.qr_code_id === id);
  },

  // Ambil semua QR
  getAllQR: () => qrDataList,
};
