# Projek Sistem Absensi (QR Code + ML)

Aplikasi absensi berbasis QR Code dengan mobile app (Expo/React Native) dan backend Node.js/Express, terhubung ke MySQL. Tersedia modul izin, rekap kehadiran, serta prediksi kehadiran menggunakan model Random Forest (Python).

## Fitur
- Generate QR Code presensi oleh guru dari layar `GuruHome`
- Scan QR oleh siswa untuk melakukan presensi
- Auto-absent job di backend
- Pengajuan izin siswa dengan upload bukti, approval oleh guru
- Riwayat kehadiran per siswa dan rekap per kelas
- Prediksi kehadiran via Python RandomForest

## Arsitektur
- `frontend/` Expo React Native app
- `backend/` Express API + MySQL + Python integration
- `backend/randomforest/` skrip Python, model, dan dataset

## Prasyarat
- Node.js 18+
- npm atau yarn
- Python 3.11 (untuk modul prediksi)
- MySQL 8.x (database: `sistem_absensi`)

## Setup Cepat
1) Install dependency
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2) Setup Database MySQL
- Install MySQL 8.x atau gunakan XAMPP/WAMP
- Jalankan skrip database:
```bash
mysql -u root -p < database/setup_complete.sql
```
- Sesuaikan `backend/config/configDB.js` bila perlu (host, user, password)

3) Jalankan backend
```bash
cd backend
npm run dev
# Server listens on 0.0.0.0, default PORT=3000
# Console akan menampilkan IP lokal, contoh: http://192.168.1.10:3000
```

4) Set baseURL di mobile app
Ubah `frontend/utils/api.js` agar mengarah ke IP backend di jaringan lokal Anda:
```js
export const api = axios.create({
  baseURL: "http://<IP_LOKAL_BACKEND>:3000/api",
  timeout: 5000,
});
```

5) Jalankan mobile app
```bash
cd frontend
npm run start
# atau: npm run android / npm run web
```

## Struktur Direktori
```
backend/
  app.js
  config/configDB.js
  controllers/*
  routes/*
  models/*
  jobs/autoAbsent.js
  utils/getApi.js
  randomforest/
    predict.py, train_model.py, randomforest_model.pkl, dataset_absensi.*
frontend/
  App.js, index.js
  navigation/AppNavigator.js
  screens/* (Login, Register, Scan, GuruHome, Izin, dsb.)
  utils/api.js
database/
  setup_complete.sql (setup lengkap dalam satu file)
  README.md (panduan database)
```

## Endpoint Utama (ringkas)
- Auth Guru: `POST /api/guru/register`, `POST /api/guru/login`
- Auth Siswa: `POST /api/siswa/register`, `POST /api/siswa/login`, `GET /api/siswa`
- QR: `POST /api/qr/generate`, `GET /api/qr/all`
- Scan: `POST /api/scan/qr`
- Attendance: `GET /api/attendance/:nisn`, `GET /api/attendance/rekap/:kelas`
- Izin: `POST /api/izin` (form-data `bukti`), `GET /api/izin/check`, `GET /api/izin/pending`, `POST /api/izin/approval`, `GET /api/izin/today`
- Prediksi: `POST /api/predict/predict`

Detail parameter dan contoh respons ada di `docs/API.md`.

## Konfigurasi Lingkungan
- `PORT` default 3000 (lihat `backend/app.js`), bisa dioverride lewat `.env`
- IP lokal dideteksi otomatis: `backend/utils/getApi.js`
- Pastikan device dan PC berada pada jaringan Wi‑Fi yang sama

## Modul Prediksi (Python)
- Backend menjalankan `backend/randomforest/predict.py` via proses `python`
- Pastikan Python 3.11 tersedia di PATH
- Model: `randomforest/randomforest_model.pkl`
- Retrain: `randomforest/train_model.py`

## Pengembangan
- Backend: `npm run dev` (nodemon)
- Frontend: `npm run start` (Expo)

## Lisensi
Sesuaikan sesuai kebutuhan proyek.
