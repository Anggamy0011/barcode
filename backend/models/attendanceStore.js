// models/attendanceStore.js
const attendanceData = [];

module.exports = {
  // Menyimpan kehadiran baru
  addAttendance: (data) => {
    attendanceData.push(data);
  },

  // Cek apakah siswa sudah scan untuk sesi tertentu
  hasScanned: (nisn, tanggal, mapel) => {
    return attendanceData.some(
      (item) => item.nisn === nisn && item.tanggal === tanggal && item.mapel === mapel
    );
  },

  // Ambil semua data absensi
  getAll: () => attendanceData,
};