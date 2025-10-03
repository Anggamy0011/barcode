import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import { api } from "../utils/api";
import { useIsFocused } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function GuruHomeScreen() {
  const [namaGuru, setNamaGuru] = useState("");
  const [nidn, setNidn] = useState("");
  const [kelas, setKelas] = useState("");
  const [mapel, setMapel] = useState("");
  const [tanggal, setTanggal] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [jamAwal, setJamAwal] = useState("");
  const [jamAkhir, setJamAkhir] = useState("");
  const [qrValue, setQrValue] = useState(null);
  const [todayIzin, setTodayIzin] = useState([]);
  const [loadingToday, setLoadingToday] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchGuruInfo = async () => {
      const storedNama = await AsyncStorage.getItem("nama");
      const storedNidn = await AsyncStorage.getItem("nidn");
      if (storedNama && storedNidn) {
        setNamaGuru(storedNama);
        setNidn(storedNidn);
      }
    };
    fetchGuruInfo();
  }, []);

  // Ambil semua izin hari ini (approved/rejected/pending)
  useEffect(() => {
    const fetchToday = async () => {
      try {
        setLoadingToday(true);
        // Tampilkan SEMUA izin hari ini tanpa filter kelas agar tidak hilang karena mismatch kelas
        const res = await api.get("/izin/today");
        setTodayIzin(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        // noop
      } finally {
        setLoadingToday(false);
      }
    };
    if (isFocused) {
      fetchToday();
    }
  }, [isFocused]);

  const approveIzin = async (id) => {
    try {
      await api.post("/izin/approval", { id, action: "approve" });
      // Update status pada daftar Izin Hari Ini agar langsung berubah di UI
      setTodayIzin((list) => list.map((item) => (item.id === id ? { ...item, status: "approved" } : item)));
      Alert.alert("Sukses", "Izin disetujui");
    } catch (e) {
      Alert.alert("Gagal", e?.response?.data?.error || e.message);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setTanggal(selectedDate);
  };

  const handleGenerateQR = async () => {
    if (!kelas.trim() || !mapel.trim() || !jamAwal.trim() || !jamAkhir.trim()) {
      return Alert.alert("Peringatan", "Lengkapi semua data");
    }

    const qr_code_id = uuid.v4();
    const expired = Date.now() + 1000 * 60 * 60;
    const formattedTanggal = tanggal.toISOString().split("T")[0];

    const data = {
      qr_code_id,
      nidn,
      nama: namaGuru,
      mapel,
      kelas,
      tanggal: formattedTanggal,
      jam_awal: jamAwal,
      jam_akhir: jamAkhir,
      expired,
    };

    try {
      const response = await api.post("/qr/generate", data);
      if (response.data && response.data.qrData) {
        setQrValue(response.data.qrData.qr_code_id);
        Alert.alert(
          "Berhasil",
          `QR Code berhasil dibuat. ID: ${response.data.qrData.qr_code_id}`
        );
      } else Alert.alert("Gagal", "QR Code tidak dikembalikan server");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal membuat QR");
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      extraScrollHeight={80}
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.header}>Generate QR Code Presensi</Text>

      <Text style={styles.readonlyInput}>NIDN: {nidn}</Text>
      <Text style={styles.readonlyInput}>Nama: {namaGuru}</Text>

      <TextInput
        style={styles.input}
        placeholder="Kelas (contoh: 9A)"
        value={kelas}
        onChangeText={setKelas}
      />
      <TextInput
        style={styles.input}
        placeholder="Mata Pelajaran"
        value={mapel}
        onChangeText={setMapel}
      />

      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: "#000", fontSize: 16 }}>
          {tanggal.toISOString().split("T")[0]}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={tanggal}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Jam Pelajaran Awal (08:00)"
        value={jamAwal}
        onChangeText={setJamAwal}
      />
      <TextInput
        style={styles.input}
        placeholder="Jam Pelajaran Akhir (09:30)"
        value={jamAkhir}
        onChangeText={setJamAkhir}
      />

      <TouchableOpacity style={styles.button} onPress={handleGenerateQR}>
        <Text style={styles.buttonText}>Buat QR Code</Text>
      </TouchableOpacity>

      {qrValue && (
        <View style={styles.qrContainer}>
          <Text style={styles.qrText}>QR Code berhasil dibuat:</Text>
          <QRCode value={qrValue} size={220} />
          <Text style={styles.qrId}>ID: {qrValue}</Text>
        </View>
      )}

      {/* Izin Hari Ini */}
      <View style={styles.izinCard}>
        <Text style={styles.header}>Izin Hari Ini {loadingToday ? "(memuat...)" : ""}</Text>
        {todayIzin.length === 0 ? (
          <Text style={{ color: "#555" }}>Belum ada pengajuan izin hari ini coba lagi.</Text>
        ) : (
          todayIzin.map((item) => (
            <View key={item.id} style={styles.izinRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.izinNama}>{item.nama} ({item.nisn})</Text>
                <Text style={styles.izinSub}>{item.kelas} • {item.tanggal?.slice(0,10)}</Text>
                <Text style={styles.izinAlasan}>Alasan: {item.alasan}</Text>
              </View>
              {item.status === 'pending' ? (
                <TouchableOpacity style={styles.approveBtn} onPress={() => approveIzin(item.id)}>
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>Accept</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.statusChip(item.status)}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', textTransform: 'capitalize' }}>{item.status}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#f0f4f7",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2e7d32",
  },
  readonlyInput: {
    width: "100%",
    height: 40,
    fontSize: 16,
    color: "#444",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#2e7d32",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  qrContainer: {
    marginTop: 30,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 4,
    width: "100%",
  },
  qrText: { fontSize: 16, marginBottom: 10 },
  qrId: { marginTop: 10, fontSize: 14, color: "#555" },
  izinCard: { marginTop: 24, backgroundColor: "#fff", borderRadius: 12, padding: 16, width: "100%" },
  izinRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderColor: "#eee" },
  izinNama: { fontWeight: "bold", color: "#333" },
  izinSub: { color: "#666", fontSize: 12, marginTop: 2 },
  izinAlasan: { color: "#444", marginTop: 4 },
  approveBtn: { backgroundColor: "#2e7d32", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginLeft: 10 },
  statusChip: (status) => ({
    backgroundColor:
      status === 'approved' ? '#2e7d32' : status === 'rejected' ? '#c62828' : '#f9a825',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  }),
});
