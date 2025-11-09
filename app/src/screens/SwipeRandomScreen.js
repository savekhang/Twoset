import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "@env";
import styles from "../styles/SwipeRandomScreen.styles";

export default function SwipeRandomScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seenUsers, setSeenUsers] = useState(new Set());

  // ✅ Lấy user ngẫu nhiên
  const fetchRandomUser = async (isRetry = false) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${API_BASE_URL}/users/random`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newUser = res.data.user;
      if (!newUser) return setUser(null);

      if (seenUsers.has(newUser.id)) {
        if (!isRetry) fetchRandomUser(true);
        else {
          setSeenUsers(new Set());
          setUser(newUser);
        }
      } else setUser(newUser);
    } catch (err) {
      console.error("Fetch random user error:", err.response?.data || err.message);
      Alert.alert("Lỗi", "Không thể tải người dùng ngẫu nhiên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomUser();
  }, []);

  // ❌ Dislike
  const handleDislike = () => {
    if (user) {
      setSeenUsers((prev) => new Set(prev.add(user.id)));
      fetchRandomUser();
    }
  };

  // Like 
  const handleLike = async () => {
    if (!user) return;

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/like/like`,
        { likedId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { message, alreadyLiked, match } = res.data;

      if (alreadyLiked) {
        Alert.alert("Thông báo", message);
      } else if (match) {
        Alert.alert("🎉 Match!", "Hai bạn đã match thành công!");
      } else {
        Alert.alert("❤️ Thành công", message || "Bạn đã thả tim người này.");
      }

      setSeenUsers((prev) => new Set(prev.add(user.id)));
      fetchRandomUser();
    } catch (err) {
      console.error("Like error:", err.response?.data || err.message);
      if (err.response?.status === 403) {
        Alert.alert("Giới hạn", "Bạn đã đạt giới hạn 5 lượt like hôm nay.");
      } else {
        Alert.alert("Lỗi", "Không thể gửi like.");
      }
    }
  };

  // ℹ️ Xem chi tiết hồ sơ
  const handleViewProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!user?.id) return Alert.alert("Lỗi", "Không xác định được người dùng hiện tại.");

      const res = await axios.get(`${API_BASE_URL}/users/userProfile/${user.id}`, {
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

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d6d" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={{ uri: user.avatar_url }} style={styles.avatar} />

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{user.name}, {user.age}</Text>
          <Text style={styles.location}>{user.location}</Text>
          <Text style={styles.bio}>{user.bio}</Text>
        </View>

        <View style={styles.actionButtons}>
          {/* ❌ */}
          <TouchableOpacity style={[styles.iconCircle, styles.dislike]} onPress={handleDislike}>
            <Ionicons name="close" size={36} color="#fff" />
          </TouchableOpacity>

          {/* ℹ️ */}
          <TouchableOpacity style={[styles.iconCircle, styles.info]} onPress={handleViewProfile}>
            <Ionicons name="information-circle" size={36} color="#fff" />
          </TouchableOpacity>

          {/* ❤️ */}
          <TouchableOpacity style={[styles.iconCircle, styles.like]} onPress={handleLike}>
            <Ionicons name="heart" size={36} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
