import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import seaborn as sns
import matplotlib.pyplot as plt
import joblib

# =========================
# 1. Membaca dataset
# =========================
print("=== 1. Membaca dataset ===")
df = pd.read_excel("dataset_absensi.xlsx")
print("Nama kolom:", list(df.columns))

# =========================
# 2. Hitung skor disiplin
# =========================
print("=== 2. Membuat skor disiplin dengan bobot ===")
bobot_sakit = 0.2
bobot_izin = 0.5
bobot_alfa = 1

df["SkorDisiplin"] = (
    df["hadir"]*1 - df["sakit"]*bobot_sakit - 
    df["izin"]*bobot_izin - df["alfa"]*bobot_alfa
)

total_hari = df["hadir"] + df["sakit"] + df["izin"] + df["alfa"]
df["PersentaseDisiplinBobot"] = (df["SkorDisiplin"] / total_hari) * 100

def kategori(persen):
    if persen >= 80:
        return "Tinggi"
    elif persen >= 60:
        return "Sedang"
    else:
        return "Rendah"

df["LabelBobot"] = df["PersentaseDisiplinBobot"].apply(kategori)
print("Jumlah data awal:")
print(df["LabelBobot"].value_counts())

# =========================
# 3. Fungsi tambah variasi otomatis
# =========================
def tambah_variansi(df_label, n_tambah=100):
    new_rows = []
    for _ in range(n_tambah):
        row = df_label.sample(1).iloc[0].copy()
        # tambahkan noise ±1–2
        row["hadir"] = max(0, row["hadir"] + np.random.randint(-2,3))
        row["sakit"] = max(0, row["sakit"] + np.random.randint(-2,3))
        row["izin"] = max(0, row["izin"] + np.random.randint(-2,3))
        row["alfa"] = max(0, row["alfa"] + np.random.randint(-2,3))
        
        # hitung ulang skor & persentase
        row["SkorDisiplin"] = (
            row["hadir"]*1 - row["sakit"]*bobot_sakit - 
            row["izin"]*bobot_izin - row["alfa"]*bobot_alfa
        )
        total_hari = row["hadir"] + row["sakit"] + row["izin"] + row["alfa"]
        row["PersentaseDisiplinBobot"] = (row["SkorDisiplin"] / total_hari) * 100
        row["LabelBobot"] = kategori(row["PersentaseDisiplinBobot"])
        
        new_rows.append(row)
    return pd.DataFrame(new_rows)

# =========================
# 4. Tambahkan data minoritas
# =========================
rendah_df = df[df["LabelBobot"] == "Rendah"]
sedang_df = df[df["LabelBobot"] == "Sedang"]

df_rendah_tambah = tambah_variansi(rendah_df, n_tambah=400)
df_sedang_tambah = tambah_variansi(sedang_df, n_tambah=400)

df = pd.concat([df, df_rendah_tambah, df_sedang_tambah], ignore_index=True)
print("Jumlah data setelah penambahan minoritas:")
print(df["LabelBobot"].value_counts())

# =========================
# 5. Siapkan fitur & label
# =========================
X = df[["hadir","sakit","izin","alfa"]]
y = df["LabelBobot"]

# =========================
# 6. Split train/test
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# =========================
# 7. Latih Random Forest
# =========================
print("=== 4. Melatih Random Forest ===")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=5,
    min_samples_leaf=5,
    random_state=42
)
model.fit(X_train, y_train)
print("Model berhasil dilatih")

# =========================
# 8. Cross-validation
# =========================
cv_scores = cross_val_score(model, X, y, cv=5)
print(f"Akurasi rata-rata 5-fold CV: {cv_scores.mean():.4f}")

# =========================
# 9. Evaluasi Model
# =========================
y_pred = model.predict(X_test)
print("Akurasi test set:", accuracy_score(y_test, y_pred))

# Classification Report → heatmap
report = classification_report(y_test, y_pred, output_dict=True)
report_df = pd.DataFrame(report).iloc[:-1, :3].T  # precision, recall, f1-score
plt.figure(figsize=(6,4))
sns.heatmap(report_df, annot=True, cmap='Blues', fmt=".2f")
plt.title("Classification Report")
plt.tight_layout()
plt.savefig("classification_report.png", dpi=300)
plt.show()

# Confusion Matrix → heatmap
cm = confusion_matrix(y_test, y_pred, labels=["Rendah","Sedang","Tinggi"])
plt.figure(figsize=(6,4))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=["Rendah","Sedang","Tinggi"],
            yticklabels=["Rendah","Sedang","Tinggi"])
plt.xlabel("Prediksi")
plt.ylabel("Asli")
plt.title("Confusion Matrix")
plt.tight_layout()
plt.savefig("confusion_matrix.png", dpi=300)
plt.show()

# =========================
# 10. Simpan Model
# =========================
joblib.dump(model, "randomforest_model.pkl")
print("=== 6. Model berhasil disimpan ke randomforest_model.pkl ===")

# =========================
# 11. Uji model dengan data dummy 1 siswa
# =========================
print("=== 7. Uji model dengan data dummy 1 siswa ===")
data_dummy = pd.DataFrame({
    "hadir": [10],
    "sakit": [5],
    "izin": [3],
    "alfa": [6],
})

# Load model
model_loaded = joblib.load("randomforest_model.pkl")
X_dummy = data_dummy[["hadir","sakit","izin","alfa"]]
data_dummy["PrediksiModel"] = model_loaded.predict(X_dummy)

print(data_dummy)