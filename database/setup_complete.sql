-- Complete database setup script
-- Run this single file to create everything at once

-- Create database
CREATE DATABASE IF NOT EXISTS sistem_absensi;
USE sistem_absensi;

-- Set charset
ALTER DATABASE sistem_absensi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Drop tables if exist (for clean setup)
DROP TABLE IF EXISTS `izin`;
DROP TABLE IF EXISTS `kehadiran`;
DROP TABLE IF EXISTS `qr_codes`;
DROP TABLE IF EXISTS `siswa`;
DROP TABLE IF EXISTS `guru`;

-- Create guru table
CREATE TABLE `guru` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nidn` varchar(20) NOT NULL UNIQUE,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nidn` (`nidn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create siswa table
CREATE TABLE `siswa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nisn` varchar(20) NOT NULL UNIQUE,
  `nama` varchar(100) NOT NULL,
  `jenis_kelamin` enum('L','P') DEFAULT NULL,
  `kelas` varchar(10) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nisn` (`nisn`),
  KEY `idx_kelas` (`kelas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create qr_codes table
CREATE TABLE `qr_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `qr_code_id` varchar(36) NOT NULL UNIQUE,
  `nidn` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `kelas` varchar(10) NOT NULL,
  `mapel` varchar(100) NOT NULL,
  `tanggal` date NOT NULL,
  `jam_awal` time NOT NULL,
  `jam_akhir` time NOT NULL,
  `expired` bigint(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `qr_code_id` (`qr_code_id`),
  KEY `idx_nidn` (`nidn`),
  KEY `idx_tanggal` (`tanggal`),
  KEY `idx_kelas` (`kelas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create kehadiran table
CREATE TABLE `kehadiran` (
  `id` varchar(36) NOT NULL,
  `nisn` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `kelas` varchar(10) NOT NULL,
  `mapel` varchar(100) NOT NULL,
  `minggu_ke` int(11) DEFAULT NULL,
  `tanggal` date NOT NULL,
  `jam_scan` time NOT NULL,
  `status` enum('hadir','izin','alfa') NOT NULL DEFAULT 'hadir',
  `qr_code_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nisn` (`nisn`),
  KEY `idx_tanggal` (`tanggal`),
  KEY `idx_kelas` (`kelas`),
  KEY `idx_qr_code_id` (`qr_code_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create izin table
CREATE TABLE `izin` (
  `id` varchar(36) NOT NULL,
  `nisn` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `kelas` varchar(10) NOT NULL,
  `tanggal` date NOT NULL,
  `alasan` text NOT NULL,
  `bukti_path` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nisn` (`nisn`),
  KEY `idx_tanggal` (`tanggal`),
  KEY `idx_kelas` (`kelas`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO `guru` (`nidn`, `username`, `password`, `nama`) VALUES
('1234567890', 'guru1', '$2b$10$example_hash_here', 'Budi Santoso'),
('0987654321', 'guru2', '$2b$10$example_hash_here', 'Siti Aminah');

INSERT INTO `siswa` (`nisn`, `nama`, `jenis_kelamin`, `kelas`, `password`) VALUES
('1111111111', 'Ahmad Rizki', 'L', '9A', '$2b$10$example_hash_here'),
('2222222222', 'Sari Dewi', 'P', '9A', '$2b$10$example_hash_here'),
('3333333333', 'Rudi Hartono', 'L', '9B', '$2b$10$example_hash_here'),
('4444444444', 'Maya Sari', 'P', '9B', '$2b$10$example_hash_here'),
('5555555555', 'Doni Pratama', 'L', '10A', '$2b$10$example_hash_here');

INSERT INTO `qr_codes` (`qr_code_id`, `nidn`, `nama`, `kelas`, `mapel`, `tanggal`, `jam_awal`, `jam_akhir`, `expired`) VALUES
('550e8400-e29b-41d4-a716-446655440000', '1234567890', 'Budi Santoso', '9A', 'Matematika', '2024-01-15', '08:00:00', '09:30:00', 1705302000000),
('550e8400-e29b-41d4-a716-446655440001', '1234567890', 'Budi Santoso', '9B', 'Fisika', '2024-01-15', '10:00:00', '11:30:00', 1705305600000);

INSERT INTO `kehadiran` (`id`, `nisn`, `nama`, `kelas`, `mapel`, `minggu_ke`, `tanggal`, `jam_scan`, `status`, `qr_code_id`) VALUES
('att-001', '1111111111', 'Ahmad Rizki', '9A', 'Matematika', 1, '2024-01-15', '08:15:00', 'hadir', '550e8400-e29b-41d4-a716-446655440000'),
('att-002', '2222222222', 'Sari Dewi', '9A', 'Matematika', 1, '2024-01-15', '08:20:00', 'hadir', '550e8400-e29b-41d4-a716-446655440000'),
('att-003', '3333333333', 'Rudi Hartono', '9B', 'Fisika', 1, '2024-01-15', '10:10:00', 'hadir', '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO `izin` (`id`, `nisn`, `nama`, `kelas`, `tanggal`, `alasan`, `bukti_path`, `status`) VALUES
('izin-001', '4444444444', 'Maya Sari', '9B', '2024-01-16', 'Sakit demam', 'uploads/izin/bukti-001.jpg', 'pending'),
('izin-002', '5555555555', 'Doni Pratama', '10A', '2024-01-16', 'Acara keluarga', 'uploads/izin/bukti-002.jpg', 'approved');

-- Show success message
SELECT 'Database sistem_absensi berhasil dibuat!' as message;
