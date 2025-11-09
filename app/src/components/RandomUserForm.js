// src/components/RandomUserForm.js
import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import apiClient from "../app_api/apiClient"; // ✅ dùng apiClient đã tạo
import styles from "../styles/RandomUserForm.styles";

const RandomUserForm = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRandomUser = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/users/random"); // ✅ token tự động gắn
      setUser(res.data.user);
    } catch (err) {
      console.error("Fetch random user error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff5a5f" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không có user nào để hiển thị</Text>
        <TouchableOpacity onPress={fetchRandomUser} style={styles.retryButton}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
      <Text style={styles.name}>{user.name}, {user.age}</Text>
      <Text style={styles.location}>{user.location}</Text>
      <Text style={styles.bio}>{user.bio}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.dislikeButton} onPress={fetchRandomUser}>
          <Text style={styles.dislikeText}>👎</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeButton} onPress={fetchRandomUser}>
          <Text style={styles.likeText}>👍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RandomUserForm;
