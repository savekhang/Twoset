import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import apiClient from "../app_api/apiClient";

const { width } = Dimensions.get("window");

export default function InteractionHistoryScreen({ navigation }) {
  const [likedByMe, setLikedByMe] = useState([]);
  const [likedByOthers, setLikedByOthers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get("/interaction/history");
      setLikedByMe(res.data.likedByMe || []);
      setLikedByOthers(res.data.likedByOthers || []);
      setMatches(res.data.matches || []);
    } catch (err) {
      console.error("🔥 Lỗi fetch lịch sử:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderItem = (item, type) => (
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      onPress={() =>
        navigation.navigate(type === "match" ? "DetailMess" : "UserProfile", { userId: item.user_id })
      }
    >
      <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={{ opacity: 0.6, fontSize: 14 }}>
          {type === "likedByMe" && (item.is_super_like ? "Super Like ⭐" : "Like ❤️")}
          {type === "likedByOthers" && "Liked you ❤️"}
          {type === "match" && "Match 💘"} • {type === "match" ? item.matched_at : item.liked_at}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff3366" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Liked by me */}
      <Text style={styles.sectionTitle}>Đã Like</Text>
      {likedByMe.length === 0 && <Text style={styles.emptyText}>Bạn chưa like ai.</Text>}
      {likedByMe.map((item) => renderItem(item, "likedByMe"))}

      <View style={{ height: 20 }} />

      {/* Liked by others */}
      <Text style={styles.sectionTitle}>Ai đã Like bạn</Text>
      {likedByOthers.length === 0 && <Text style={styles.emptyText}>Chưa ai like bạn.</Text>}
      {likedByOthers.map((item) => renderItem(item, "likedByOthers"))}

      <View style={{ height: 20 }} />

      {/* Matches */}
      <Text style={styles.sectionTitle}>Matches</Text>
      {matches.length === 0 && <Text style={styles.emptyText}>Bạn chưa match ai.</Text>}
      {matches.map((item) => renderItem(item, "match"))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdfdfd", marginTop: 40, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#ff3366" },
  emptyText: { opacity: 0.6, marginBottom: 10, fontSize: 15 },
  card: {
    flexDirection: "row",
    backgroundColor: "#ffe9e9ff",
    borderRadius: 15,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    alignItems: "center",
    padding: 10,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  infoContainer: { flex: 1 },
  name: { fontSize: 18, fontWeight: "700", color: "#222" },
});
