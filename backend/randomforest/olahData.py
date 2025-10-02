import pandas as pd

# === 1. Baca file dan ambil Sheet7 ===
file_path = "REKAP KEHADIRAN.xlsx"   # sesuaikan dengan lokasi file kamu
df = pd.read_excel(file_path, sheet_name="Sheet7", header=4)

# === 2. Bersihkan data ===
# Buang baris kosong & ambil hanya yang ada Nama Siswa
df = df.dropna(subset=["Nama Siswa"]).reset_index(drop=True)

# Buang baris yang isinya "Tahun" di kolom Tahun (header duplikat)
df = df[df["Tahun"] != "Tahun"]

# Pastikan kolom Tahun berupa angka
df["Tahun"] = pd.to_numeric(df["Tahun"], errors="coerce")

# === 3. Mapping nama bulan ===
bulan_mapping = {
    "JUL": "Juli",
    "AGS": "Agustus",
    "SEPT": "September",
    "OKT": "Oktober",
    "NOV": "November",
    "DES": "Desember",
    "JAN": "Januari",
    "FEB": "Februari",
    "MAR": "Maret",
    "APR": "April",
    "MEI": "Mei",
    "JUN": "Juni"
}

# === 4. Ambil kolom bulan ===
data_list = []
for kode, nama_bulan in bulan_mapping.items():
    if kode in df.columns:
        s_col = kode
        i_col = df.columns[df.columns.get_loc(kode)+1]
        a_col = df.columns[df.columns.get_loc(kode)+2]
        
        for _, row in df.iterrows():
            nama = row["Nama Siswa"]
            tahun = int(row["Tahun"]) if pd.notna(row["Tahun"]) else None
            sakit = int(row[s_col]) if pd.notna(row[s_col]) else 0
            izin = int(row[i_col]) if pd.notna(row[i_col]) else 0
            alfa = int(row[a_col]) if pd.notna(row[a_col]) else 0

            # Hitung total hari (misalnya 24 hari efektif per bulan)
            total_hari = 24
            hadir = total_hari - (sakit + izin + alfa)
            persentase = round((hadir / total_hari) * 100, 2) if total_hari > 0 else 0

            # Label kedisiplinan
            if persentase <= 50:
                label = "Rendah"
            elif persentase <= 80:
                label = "Sedang"
            else:
                label = "Tinggi"

            data_list.append({
                "Nama": nama,
                "Tahun": tahun,
                "Bulan": nama_bulan,
                "Jumlah Hadir": hadir,          # ✅ Tambahan kolom hadir
                "Jumlah Sakit": sakit,
                "Jumlah Izin": izin,
                "Jumlah Alfa": alfa,
                "Persentase Disiplin": persentase,
                "Label": label
            })

# === 5. Buat DataFrame akhir ===
df_final = pd.DataFrame(data_list)

# Simpan ke Excel / CSV
df_final.to_excel("dataset_absensi.xlsx", index=False)
df_final.to_csv("dataset_absensi.csv", index=False)

print(df_final.head(20))