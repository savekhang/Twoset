import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import axios from "axios";
import { API_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function JoinGroupScreen({ route, navigation }) {
  const { chat_id, chat_name } = route.params;
  const [password, setPassword] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPassword = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        console.log("Checking password for chat_id:", chat_id);
        const res = await axios.get(`${API_BASE_URL}/group/info/${chat_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Room info:", res.data);

        if (!res.data.chat?.password) {
          setRequiresPassword(false);
          handleJoin("");
        }
      } catch (err) {
        console.error("Check room password error:", err.response?.data || err.message);
        Alert.alert("Error", "Không thể kiểm tra phòng: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    checkPassword();
  }, []);

  const handleJoin = async (pwd = password) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/group/join`,
        { chat_id, password: pwd },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigation.replace("GrChat", { chat_id, chat_name });
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Lỗi join phòng");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#ff4d67" />
      </View>
    );
  }

  return requiresPassword ? (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#ff4d67" }}>
        Tham gia phòng: {chat_name}
      </Text>

      <Text style={{ marginBottom: 8, fontSize: 16, color: "#333" }}>Nhập mật khẩu:</Text>
      <TextInput
        placeholder="Password..."
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
          borderColor: "#ddd",
          backgroundColor: "#fafafa",
          fontSize: 16,
        }}
        secureTextEntry
      />

      <TouchableOpacity
        onPress={() => handleJoin(password)}
        style={{
          backgroundColor: "#ff4d67",
          paddingVertical: 14,
          borderRadius: 12,
          marginTop: 20,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 18, fontWeight: "bold" }}>Tham gia</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 18, color: "#333" }}>Đang tham gia phòng {chat_name}...</Text>
      <ActivityIndicator size="large" color="#ff4d67" style={{ marginTop: 20 }} />
    </View>
  );
}
