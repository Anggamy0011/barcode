import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function HomeScreen({ navigation, route }) {
  const studentData = {
    nama: route.params?.nama || "-",
    nis: route.params?.nisn || "-",
    kelas: route.params?.kelas || "-",
  };

  return (
    <View style={styles.container}>
      {/* Foto Profil */}
      <Image
        source={require("../assets/suzuran.jpeg")}
        style={styles.profileImage}
      />

      {/* Data Siswa */}
      <View style={styles.card}>
        <Text style={styles.label}>Nama</Text>
        <Text style={styles.value}>{studentData.nama}</Text>

        <Text style={styles.label}>NIS</Text>
        <Text style={styles.value}>{studentData.nis}</Text>

        <Text style={styles.label}>Kelas</Text>
        <Text style={styles.value}>{studentData.kelas}</Text>
      </View>

      {/* Tombol Absen */}
      <TouchableOpacity
        style={styles.absenButton}
        onPress={() => navigation.navigate("Scan")}
      >
        <Text style={styles.absenText}>Scan QR untuk Absen</Text>
      </TouchableOpacity>

      {/* Tombol Izin */}
      <TouchableOpacity
        style={[styles.absenButton, { marginTop: 12, backgroundColor: "#1976d2" }]}
        onPress={() => navigation.navigate("Izin")}
      >
        <Text style={styles.absenText}>Ajukan Izin</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    alignItems: "center",
    backgroundColor: "#e8f5e9",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#2e7d32",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "100%",
    padding: 20,
    elevation: 4,
    shadowColor: "#333",
    shadowOpacity: 0.2,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  absenButton: {
    backgroundColor: "#388e3c",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  absenText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});