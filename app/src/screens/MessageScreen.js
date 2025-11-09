// screens/MessageScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "@env";
import styles from "../styles/MessageScreen.styles";

export default function MessageScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Lấy danh sách người đã match
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${API_BASE_URL}/mess/match-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🔹 BE trả về là mảng trực tiếp, không có field matches
      setMatches(res.data || []);
    } catch (err) {
      console.error("Fetch matches error:", err.response?.data || err.message);
      Alert.alert("Lỗi", "Không thể tải danh sách match");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    const unsubscribe = navigation.addListener("focus", fetchMatches);
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d6d" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.matchItem}
      onPress={() => navigation.navigate("DetailMess", { matchUser: item })}
    >
      <Image
        source={{ uri: item.partner_avatar }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.partner_name}</Text>
        <Text style={styles.lastMessage}>
          {item.last_message || "Nhấn để trò chuyện..."}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tin nhắn</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.match_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
            Chưa có ai để trò chuyện 😢
          </Text>
        }
      />
    </View>
  );
}
