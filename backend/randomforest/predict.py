import sys
import json
import joblib
import pandas as pd

# Baca input dari Node.js
data = json.loads(sys.argv[1])

# Load model
model = joblib.load("python/model.pkl")

# Format ke DataFrame (harus sesuai dengan format saat training model)
# Contoh: {"qrData": "SISWA123", "waktu": 8}
input_df = pd.DataFrame([{
    "kode": data["qrData"],       # atau fitur lainnya
    "waktu": data["waktu"]        # misalnya jam kehadiran
}])

# Prediksi
result = model.predict(input_df)

# Output ke Node.js
print(result[0])
