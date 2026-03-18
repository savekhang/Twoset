// screens/MessageScreen.js (clean + correct + thêm icon nhóm chat)
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
import { Ionicons } from "@expo/vector-icons";

export default function MessageScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách match
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${API_BASE_URL}/mess/match-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      <Image source={{ uri: item.partner_avatar }} style={styles.avatar} />

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
      {/* HEADER + ICON NHÓM CHAT */}
      <View style={{ ...styles.headerRow, justifyContent: "center", alignItems: "center" }}>
        <Text style={styles.header}>Tin nhắn</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("GrChatIn")}
          style={{ position: "absolute", right: 10, top: 0, padding: 6 }}
        >
          <Ionicons name="people" size={28} color="#ff4d6d" />
        </TouchableOpacity>
      </View>

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
