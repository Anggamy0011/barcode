# Database Setup Guide

Folder ini berisi skrip SQL untuk membuat database sistem absensi dari awal.

## Cara Setup Database

### 1. Install MySQL
- Download dan install MySQL 8.x dari [mysql.com](https://dev.mysql.com/downloads/)
- Atau gunakan XAMPP/WAMP yang sudah include MySQL

### 2. Buat Database
Jalankan file SQL secara berurutan:

```bash
# Masuk ke MySQL CLI
mysql -u root -p

# Atau gunakan MySQL Workbench/GUI lainnya
```

```sql
-- 1. Buat database
SOURCE database/01_create_database.sql;

-- 2. Buat tabel guru
SOURCE database/02_create_guru_table.sql;

-- 3. Buat tabel siswa  
SOURCE database/03_create_siswa_table.sql;

-- 4. Buat tabel qr_codes
SOURCE database/04_create_qr_codes_table.sql;

-- 5. Buat tabel kehadiran
SOURCE database/05_create_kehadiran_table.sql;

-- 6. Buat tabel izin
SOURCE database/06_create_izin_table.sql;

-- 7. Insert sample data (opsional)
SOURCE database/07_sample_data.sql;
```

### 3. Konfigurasi Backend
Pastikan `backend/config/configDB.js` sesuai dengan setting MySQL:

```js
const db = mysql.createConnection({
  host: "localhost",     // atau IP MySQL server
  user: "root",          // username MySQL
  password: "",          // password MySQL
  database: "sistem_absensi",
});
```

### 4. Verifikasi
- Jalankan backend: `npm run dev`
- Cek console apakah ada pesan "MySQL Connected..."
- Test endpoint API untuk memastikan database terhubung

## Struktur Database

### Tabel Utama:
- `guru` - Data guru/pengajar
- `siswa` - Data siswa
- `qr_codes` - QR code yang dibuat guru
- `kehadiran` - Riwayat absensi siswa
- `izin` - Pengajuan izin siswa

### Relasi:
- `qr_codes.nidn` → `guru.nidn`
- `kehadiran.nisn` → `siswa.nisn`
- `kehadiran.qr_code_id` → `qr_codes.qr_code_id`
- `izin.nisn` → `siswa.nisn`

## Troubleshooting

### Error "Access denied"
- Pastikan username/password MySQL benar
- Cek apakah user memiliki privilege CREATE/DROP database

### Error "Table already exists"
- Hapus database lama: `DROP DATABASE sistem_absensi;`
- Atau gunakan `CREATE TABLE IF NOT EXISTS` (sudah ada di skrip)

### Error "Character set"
- Pastikan MySQL menggunakan utf8mb4
- Skrip sudah include charset setting

## Backup & Restore

### Backup:
```bash
mysqldump -u root -p sistem_absensi > backup_absensi.sql
```

### Restore:
```bash
mysql -u root -p sistem_absensi < backup_absensi.sql
```
