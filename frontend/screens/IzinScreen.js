import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../utils/api";

export default function IzinScreen({ navigation }) {
  const [nisn, setNisn] = useState("");
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [alasan, setAlasan] = useState("");
  const [bukti, setBukti] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const u = JSON.parse(userData);
        setNisn(u.nisn || "");
        setNama(u.nama || "");
        setKelas(u.kelas || "");
      }
    })();
  }, []);

  const pickDocument = async () => {
    const res = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
    if (res.type === "success") {
      setBukti(res);
    }
  };

  const submitIzin = async () => {
    if (!alasan) {
      Alert.alert("Validasi", "Alasan wajib diisi");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("nisn", nisn);
      formData.append("nama", nama);
      formData.append("kelas", kelas);
      formData.append("alasan", alasan);
      if (bukti) {
        formData.append("bukti", {
          uri: bukti.assets?.[0]?.uri || bukti.uri,
          name: bukti.name || "bukti",
          type: bukti.mimeType || "application/octet-stream",
        });
      }
      await api.post("/izin", formData, { headers: { "Content-Type": "multipart/form-data" } });
      Alert.alert("Sukses", "Pengajuan izin berhasil dikirim", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Gagal", e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Nama</Text>
        <Text style={styles.value}>{nama}</Text>
        <Text style={styles.label}>NISN</Text>
        <Text style={styles.value}>{nisn}</Text>
        <Text style={styles.label}>Kelas</Text>
        <Text style={styles.value}>{kelas}</Text>

        <Text style={styles.label}>Alasan Izin</Text>
        <TextInput
          style={styles.input}
          placeholder="Tuliskan alasan izin"
          value={alasan}
          onChangeText={setAlasan}
          multiline
        />

        <TouchableOpacity style={styles.pickBtn} onPress={pickDocument}>
          <Text style={styles.pickText}>{bukti ? "Ganti Bukti" : "Pilih Bukti (opsional)"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={submitIzin} disabled={loading}>
          <Text style={styles.submitText}>{loading ? "Mengirim..." : "Kirim Izin"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#e8f5e9" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  label: { marginTop: 10, color: "#666" },
  value: { fontWeight: "bold", color: "#333" },
  input: { marginTop: 8, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, minHeight: 80 },
  pickBtn: { marginTop: 14, backgroundColor: "#90caf9", padding: 12, borderRadius: 10, alignItems: "center" },
  pickText: { color: "#0d47a1", fontWeight: "bold" },
  submitBtn: { marginTop: 16, backgroundColor: "#388e3c", padding: 14, borderRadius: 10, alignItems: "center" },
  submitText: { color: "#fff", fontWeight: "bold" },
});


