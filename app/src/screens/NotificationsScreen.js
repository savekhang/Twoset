import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NotificationsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // ✅ Lấy token từ AsyncStorage
  const getToken = async () => {
    return await AsyncStorage.getItem("token");
  };

  // ✅ Fetch danh sách thông báo
  const fetchNotifications = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API_BASE_URL}/noti`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && res.data.notifications) {
        setNotifications(res.data.notifications);
      }

      // ✅ Đánh dấu tất cả đã đọc
      await axios.put(
        `${API_BASE_URL}/noti/markAllAsRead`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Lỗi tải thông báo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchNotifications);
    return unsubscribe;
  }, [navigation]);

  // ✅ Xử lý nhấn vào thông báo
  const handlePressNotification = async (item) => {
  try {
    const token = await getToken();

    if (item.type === "match") {
  const withUserId = item.metadata?.withUserId;
  if (!withUserId) {
    Alert.alert("Thông báo", "Thông báo này không chứa dữ liệu chat.");
    return;
  }

  // ✅ Lấy matchUser từ danh sách match hiện tại
  // Hoặc fetch lại danh sách match nếu cần
  const token = await getToken();
  const res = await axios.get(`${API_BASE_URL}/mess/match-list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const matches = res.data || [];
  const matchUser = matches.find(m => m.match_id === withUserId || m.partner_id === withUserId);

  if (!matchUser) {
    Alert.alert("Thông báo", "Không tìm thấy thông tin chat với người này.");
    return;
  }

  navigation.navigate("DetailMess", { matchUser });
  return;
}

    // Các loại khác vẫn dùng userId
    const userId = item.metadata?.userId;
    if (!userId) return;

    const res = await axios.get(`${API_BASE_URL}/users/userProfile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const userData = res.data.user || res.data.profile;
    if (!userData) return;

    navigation.navigate("UserProfile", { user: userData });

  } catch (err) {
    console.error("Lỗi khi mở thông báo:", err);
    Alert.alert("Lỗi", "Không thể mở thông báo.");
  }
};

  // ✅ Render từng thông báo
  const renderItem = ({ item }) => {
    let icon = "notifications-outline";
    if (item.type === "like") icon = "heart";
    if (item.type === "match") icon = "people";
    if (item.type === "message") icon = "chatbubble";
    if (item.type === "system") icon = "information-circle";

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handlePressNotification(item)}
      >
        <Ionicons
          name={icon}
          size={26}
          color={item.type === "like" ? "#ff3366" : "#555"}
          style={{ marginRight: 10 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.itemMessage}>{item.message}</Text>
          <Text style={styles.itemDate}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#ff3366" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color="gray" />
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text>Không có thông báo nào.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ff3366",
    marginLeft: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemMessage: { fontSize: 15, fontWeight: "500", color: "#333" },
  itemDate: { fontSize: 12, color: "#888", marginTop: 3 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
