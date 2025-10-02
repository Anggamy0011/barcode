import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import api from "../utils/api";

export default function RegisterScreen() {
  const [nisn, setNisn] = useState("");
  const [nama, setNama] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("L");
  const [kelas, setKelas] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (
      !nisn ||
      !nama ||
      !jenisKelamin ||
      !kelas ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Peringatan", "Semua kolom wajib diisi!");
    } else if (password !== confirmPassword) {
      Alert.alert("Kesalahan", "Password dan konfirmasi tidak cocok!");
    } else {
      try {
        const response = await api.post("/siswa/register", {
          nisn,
          nama,
          jenis_kelamin: jenisKelamin,
          kelas,
          password,
        });

        if (response.data.success) {
          Alert.alert("Sukses", "Akun siswa berhasil dibuat!");
          // Reset input
          setNisn("");
          setNama("");
          setJenisKelamin("L");
          setKelas("");
          setPassword("");
          setConfirmPassword("");
        } else {
          Alert.alert(
            "Gagal",
            response.data.message || "Terjadi kesalahan saat mendaftar."
          );
        }
      } catch (error) {
        console.error("Error saat register:", error);
        Alert.alert(
          "Gagal",
          "Tidak bisa terhubung ke server. Pastikan server aktif & jaringan benar."
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar Akun Siswa</Text>

      <TextInput
        style={styles.input}
        placeholder="NISN"
        keyboardType="numeric"
        value={nisn}
        onChangeText={setNisn}
      />

      <TextInput
        style={styles.input}
        placeholder="Nama Lengkap"
        value={nama}
        onChangeText={setNama}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Jenis Kelamin</Text>
        <Picker
          selectedValue={jenisKelamin}
          onValueChange={(itemValue) => setJenisKelamin(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Laki-laki" value="L" />
          <Picker.Item label="Perempuan" value="P" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Kelas (contoh: 8A)"
        value={kelas}
        onChangeText={setKelas}
      />

      <TextInput
        style={styles.input}
        placeholder="Kata Sandi"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Konfirmasi Kata Sandi"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Daftar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
  },
  picker: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
