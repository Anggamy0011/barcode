import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState } from "react";
import api from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("siswa");

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Login Gagal", "Username dan Password wajib diisi!");
      return;
    }

    try {
      const endpoint = role === "siswa" ? "/siswa/login" : "/guru/login";
      const payload =
        role === "siswa"
          ? { nisn: username, password }
          : { nidn: username, password };

      const res = await api.post(endpoint, payload);

      if (res.data && res.data.token) {
        const { token, user } = res.data;
        const displayName = user?.nama || user?.username || "Pengguna";

        // Simpan data ke AsyncStorage
        if (role === "siswa") {
          await AsyncStorage.setItem(
            "user",
            JSON.stringify({
              nisn: user.nisn,
              nama: user.nama,
              kelas: user.kelas,
            })
          );
        } else {
          await AsyncStorage.multiSet([
            ["token", token],
            ["nama", user.nama || user.username],
            ["nidn", user.nidn],
          ]);
        }

        Alert.alert("Login Berhasil", `Selamat datang, ${displayName}`);

        if (role === "siswa") {
          navigation.navigate("Home", {
            nama: user.nama,
            nisn: user.nisn,
            kelas: user.kelas,
          });
        } else {
          navigation.navigate("HomeGuru", {
            nama: user.nama || user.username,
            nidn: user.nidn,
          });
        }
      } else {
        Alert.alert("Login Gagal", "Data tidak valid!");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Login Gagal", "Username atau Password salah!");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/al-ma'arij.png")} style={styles.logo} />
      <Text style={styles.title}>Sistem Absensi Madrasah</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#666"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Pilih Role */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => setRole("siswa")}
          style={[
            styles.roleButton,
            role === "siswa" && styles.roleButtonSelected,
          ]}
        >
          <Text
            style={[styles.roleText, role === "siswa" && { color: "#fff" }]}
          >
            Siswa
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setRole("guru")}
          style={[
            styles.roleButton,
            role === "guru" && styles.roleButtonSelected,
          ]}
        >
          <Text style={[styles.roleText, role === "guru" && { color: "#fff" }]}>
            Guru
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Masuk</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>
          Belum punya akun? Daftar di sini
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("RegisterGuru")}>
        <Text style={styles.registerText}>
          Belum punya akun? Daftar guru di sini
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
    backgroundColor: "#e8f5e9",
  },
  title: {
    fontSize: 22,
    marginBottom: 25,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2e7d32",
  },
  input: {
    height: 45,
    borderColor: "#a5d6a7",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 12,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#388e3c",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerText: {
    color: "#1b5e20",
    textAlign: "center",
    fontSize: 14,
    marginTop: 10,
    textDecorationLine: "underline",
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 15,
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#388e3c",
    marginHorizontal: 5,
  },
  roleButtonSelected: {
    backgroundColor: "#388e3c",
  },
  roleText: {
    color: "#2e7d32",
    fontWeight: "bold",
  },
});
