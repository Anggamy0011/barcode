const { v4: uuidv4 } = require("uuid");
const moment = require("moment-timezone");
const siswaModel = require("../models/siswaModel");
const kehadiranModel = require("../models/kehadiranModel");
const { getTodayQRSessions } = require("../models/qrModel");
const izinModel = require("../models/izinModel");

function parseEndWIB(tanggal, jam_akhir) {
  return moment.tz(
    `${moment(tanggal).format("YYYY-MM-DD")} ${jam_akhir}`,
    ["YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss"],
    "Asia/Jakarta"
  );
}

function processSession(session, done) {
  const nowWIB = moment().tz("Asia/Jakarta");
  const endWIB = parseEndWIB(session.tanggal, session.jam_akhir);

  if (!endWIB.isValid() || nowWIB.isBefore(endWIB)) return done();

  siswaModel.getSiswaByKelas(session.kelas, (err, siswaList) => {
    if (err) return done(err);
    if (!Array.isArray(siswaList) || siswaList.length === 0) return done();

    const tanggalStr = nowWIB.format("YYYY-MM-DD");
    const mingguKe = nowWIB.isoWeek();

    let pending = siswaList.length;
    siswaList.forEach((s) => {
      // Jika siswa memiliki izin pada tanggal ini, tandai izin, bukan alfa
      izinModel.hasApprovedIzin(s.nisn, tanggalStr, (errIzin, hasIzin) => {
        if (errIzin) {
          // fallback lanjut cek kehadiran biasa
          return kehadiranModel.checkAttendance(
            s.nisn,
            tanggalStr,
            session.mapel,
            (errCheck, exists) => {
              if (errCheck || exists) {
                pending -= 1;
                if (pending === 0) done();
                return;
              }

              const attendance = {
                id: uuidv4(),
                nisn: s.nisn,
                nama: s.nama,
                kelas: s.kelas,
                mapel: session.mapel,
                minggu_ke: mingguKe,
                tanggal: tanggalStr,
                jam_scan: endWIB.format("HH:mm:ss"),
                status: "alfa",
                qr_code_id: session.qr_code_id,
              };

              kehadiranModel.addAttendance(attendance, () => {
                pending -= 1;
                if (pending === 0) done();
              });
            }
          );
        }

        if (hasIzin) {
          // jika ada izin, simpan status izin bila belum ada kehadiran
          return kehadiranModel.checkAttendance(
            s.nisn,
            tanggalStr,
            session.mapel,
            (errCheck, exists) => {
              if (errCheck || exists) {
                pending -= 1;
                if (pending === 0) done();
                return;
              }

              const attendance = {
                id: uuidv4(),
                nisn: s.nisn,
                nama: s.nama,
                kelas: s.kelas,
                mapel: session.mapel,
                minggu_ke: mingguKe,
                tanggal: tanggalStr,
                jam_scan: endWIB.format("HH:mm:ss"),
                status: "izin",
                qr_code_id: session.qr_code_id,
              };

              kehadiranModel.addAttendance(attendance, () => {
                pending -= 1;
                if (pending === 0) done();
              });
            }
          );
        }

        // tidak punya izin → proses alfa jika belum absen
        kehadiranModel.checkAttendance(
          s.nisn,
          tanggalStr,
          session.mapel,
          (errCheck, exists) => {
            if (errCheck || exists) {
              pending -= 1;
              if (pending === 0) done();
              return;
            }

            const attendance = {
              id: uuidv4(),
              nisn: s.nisn,
              nama: s.nama,
              kelas: s.kelas,
              mapel: session.mapel,
              minggu_ke: mingguKe,
              tanggal: tanggalStr,
              jam_scan: endWIB.format("HH:mm:ss"),
              status: "alfa",
              qr_code_id: session.qr_code_id,
            };

            kehadiranModel.addAttendance(attendance, () => {
              pending -= 1;
              if (pending === 0) done();
            });
          }
        );
      });
    });
  });
}

function tick() {
  getTodayQRSessions((err, sessions) => {
    if (err || !Array.isArray(sessions) || sessions.length === 0) return;
    sessions.forEach((s) => processSession(s, () => {}));
  });
}

function startAutoAbsentJob() {
  setInterval(tick, 60 * 1000);
  tick();
}

module.exports = { startAutoAbsentJob };


