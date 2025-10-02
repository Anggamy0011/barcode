import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import api from "../utils/api";

export default function RegisterGuruScreen({ navigation }) {
  const [nidn, setNidn] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (!nidn || !username || !password || !confirmPassword) {
      Alert.alert("Peringatan", "Semua kolom wajib diisi!");
    } else if (password !== confirmPassword) {
      Alert.alert("Kesalahan", "Password dan konfirmasi tidak cocok!");
    } else {
      try {
        const response = await api.post("/guru/register", {
          nidn,
          username,
          password,
        });

        if (response.status === 201) {
          Alert.alert("Sukses", "Akun guru berhasil dibuat!");
          // Reset input
          setNidn("");
          setUsername("");
          setPassword("");
          setConfirmPassword("");

          navigation.navigate("Login"); // arahkan ke halaman login
        } else {
          Alert.alert(
            "Gagal",
            response.data.message || "Terjadi kesalahan saat mendaftar."
          );
        }
      } catch (error) {
        console.error("Error saat register guru:", error);
        Alert.alert(
          "Gagal",
          "Tidak bisa terhubung ke server. Pastikan server aktif & jaringan benar."
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar Akun Guru</Text>

      <TextInput
        style={styles.input}
        placeholder="NIDN"
        keyboardType="numeric"
        value={nidn}
        onChangeText={setNidn}
      />

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
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
  button: {
    backgroundColor: "#007bff",
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
