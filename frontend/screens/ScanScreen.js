import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function ScanScreen({ navigation, route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);


  const [nisn, setNisn] = useState("");
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");

  useEffect(() => {
  const getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
       console.log("Isi user dari AsyncStorage:", userData);
      if (userData) {
        const parsed = JSON.parse(userData);
        setNisn(parsed.nisn);
        setNama(parsed.nama);
        setKelas(parsed.kelas);
      }
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
    }
  };

  getUserData();
}, []);

  useEffect(() => {
    if (!permission || !permission.granted) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    try {
      const response = await api.post("/scan/qr", {
        nisn,
        nama,
        kelas,
        qr_code_id: data,
      });

      const result = response.data;

      Alert.alert(
        result.status === "success" ? "✅ Presensi Berhasil" : "❌ Presensi Gagal",
        result.message || "Gagal presensi",
        [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
              setLoading(false);
              if (result.status === "success") {
                navigation.goBack();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.log("Error:", error?.response?.data || error.message);
      Alert.alert("❌ Error", "Gagal menghubungi server.");
      setScanned(false);
      setLoading(false);
    }
  };

  if (!permission) return <Text>Meminta izin kamera...</Text>;
  if (!permission.granted) return <Text>Izin kamera ditolak</Text>;

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />

      {/* Overlay Kamera */}
      <View style={styles.overlay}>
        <View style={styles.scanBox}>
          <Text style={styles.scanText}>Arahkan QR Code ke dalam kotak</Text>
          {loading && <ActivityIndicator size="large" color="#00FF00" style={{ marginTop: 10 }} />}
        </View>

        {/* Tombol kembali */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: {
    flex: 1,
    justifyContent: "center",
  },
  scanBox: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    height: 250,
    borderWidth: 2,
    borderColor: "#00FF00",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  scanText: { color: "#fff", fontSize: 16 },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 30,
  },
});