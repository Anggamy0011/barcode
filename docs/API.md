# API Reference

Base URL: `http://<host>:<port>/api`

## Auth Guru
- POST `/guru/register`
  - body: `{ nama, nidn, password }`
  - resp: `{ message | error }`
- POST `/guru/login`
  - body: `{ nidn, password }`
  - resp: `{ token?, guru?, message | error }`

## Auth Siswa
- POST `/siswa/register`
  - body: `{ nama, nisn, kelas, password }`
- POST `/siswa/login`
  - body: `{ nisn, password }`
- GET `/siswa`
  - resp: `[{ id, nama, nisn, kelas, ... }]`

## QR
- POST `/qr/generate`
  - body: `{ qr_code_id, nidn, nama, mapel, kelas, tanggal, jam_awal, jam_akhir, expired }`
  - resp: `{ qrData: { qr_code_id, ... } }`
- GET `/qr/all`
  - resp: `[{ ...qr }]`

## Scan
- POST `/scan/qr`
  - body: `{ qr_code_id, nisn, nama, kelas, waktu? }`
  - resp: `{ message | error }`

## Attendance
- GET `/attendance/:nisn`
  - resp: `[{ tanggal, jam, status, ... }]`
- GET `/attendance/rekap/:kelas`
  - resp: `{ kelas, rangkuman: [{ tanggal, hadir, izin, alfa, ... }] }`

## Izin
- POST `/izin`
  - Content-Type: `multipart/form-data`
  - fields: `nama, nisn, kelas, tanggal, alasan`, file: `bukti`
  - resp: `{ message | error }`
- GET `/izin/check`
  - query: bisa berisi `nisn`/`tanggal`
  - resp: `{ ada: boolean, data? }`
- GET `/izin/pending`
  - resp: `[{ id, nama, nisn, kelas, tanggal, alasan, buktiUrl, status }]`
- POST `/izin/approval`
  - body: `{ id, action: "approve" | "reject" }`
  - resp: `{ message }`
- GET `/izin/today`
  - resp: `[{ id, nama, nisn, kelas, tanggal, alasan, status }]`

## Prediksi
- POST `/predict/predict`
  - body: `{ fitur1, fitur2, ... }` sesuai kebutuhan `randomforest/predict.py`
  - resp: `{ prediction: any }` atau `{ error }`

## Catatan
- Semua contoh disederhanakan, sesuaikan dengan implementasi controller sebenarnya.
- Gunakan token auth jika backend menambahkan middleware otentikasi di masa depan.
