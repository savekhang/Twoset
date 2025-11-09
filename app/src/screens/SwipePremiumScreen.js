// SwipePremiumScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

const { width } = Dimensions.get("window");

export default function SwipePremiumScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/users/swipe-premium`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      setUsers(Array.isArray(res.data.users) ? res.data.users : []);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message || err);
      Alert.alert(
        "Lỗi",
        "Không lấy được kết quả tương thích. Kiểm tra kết nối hoặc thử lại.",
        [
          { text: "Thử lại", onPress: () => fetchMatches() },
          { text: "Hủy", style: "cancel" },
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMatches();
  }, [fetchMatches]);

  // ⚡ Hàm xem chi tiết hồ sơ
  const handleViewProfile = async (userId) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${API_BASE_URL}/users/userProfile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigation.navigate("UserProfile", { user: res.data.profile });
    } catch (err) {
      console.error("Fetch user profile error:", err.response?.data || err.message);
      Alert.alert("Lỗi", "Không thể tải hồ sơ người dùng");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const avatar = item.avatar_url || "https://i.pravatar.cc/200";
    const name = item.name || "Người dùng";
    const bio = item.bio || "";
    const shared = item.sharedInterests ?? 0;
    const ageDiff = item.ageDiff ?? "-";

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        onPress={() => handleViewProfile(item.id)} // 🔥 Gọi xem chi tiết
      >
        <Image source={{ uri: avatar }} style={styles.avatar} />

        <View style={styles.cardContent}>
          <View style={styles.rowTop}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.score}>💖 {item.compatibility ?? 0}%</Text>
          </View>

          <Text style={styles.bio} numberOfLines={2}>
            {bio}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>🎯 {shared} sở thích chung</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>👶 lệch {ageDiff} tuổi</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#ff3366" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kết quả tương thích cao </Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={
          users.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Không tìm thấy kết quả phù hợp.</Text>
            <Text style={styles.emptySub}>
              Hãy thử thay đổi tiêu chí hoặc thử lại sau.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const CARD_PADDING = 12;
const AVATAR_SIZE = 72;
const CARD_HEIGHT = 110;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fee1e1ff", paddingHorizontal: 14, paddingTop: 60 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ff3366",
    marginBottom: 18,
    alignSelf: "center",
  },
  listContent: { paddingBottom: 30 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f8fa",
    padding: CARD_PADDING,
    borderRadius: 14,
    marginVertical: 8,
    minHeight: CARD_HEIGHT,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#ddd",
  },
  cardContent: { flex: 1, justifyContent: "center" },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontSize: 16, fontWeight: "700", color: "#222", maxWidth: width - AVATAR_SIZE - 80 },
  score: { fontSize: 13, color: "#ff3366", fontWeight: "700", marginLeft: 8 },
  bio: { color: "#555", marginTop: 6, fontSize: 13, lineHeight: 18 },
  metaRow: { marginTop: 8, flexDirection: "row", alignItems: "center" },
  metaText: { color: "#888", fontSize: 12 },
  metaDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ddd", marginHorizontal: 8 },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flexGrow: 1 },
  emptyBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#666", textAlign: "center" },
});
