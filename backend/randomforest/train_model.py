import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# Dummy data
data = pd.DataFrame({
    "kode": [1, 2, 3, 4],
    "waktu": [7, 8, 9, 10],
})
label = ["hadir", "hadir", "terlambat", "tidak hadir"]

# Train model
model = RandomForestClassifier()
model.fit(data, label)

# Simpan model
joblib.dump(model, "model.pkl")
