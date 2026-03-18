// ✅ UserProfileScreen.js (đã sửa phần handleLike)
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

const NUM_COLUMNS = 3;
const ITEM_MARGIN = 4;
const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - ITEM_MARGIN * (NUM_COLUMNS * 2)) / NUM_COLUMNS;

export default function UserProfileScreen({ route, navigation }) {
  const { user } = route.params;
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Không có dữ liệu người dùng.</Text>
      </View>
    );
  }

  // ❤️ Thả tim — giống hệt SwipeRandomScreen
  const handleLike = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Lỗi", "Token không tồn tại, vui lòng đăng nhập lại.");
        return;
      }
      console.log("❤️ Like user:", user.id);
      console.log("📦 Token:", token?.slice(0, 20) + "...");
      const res = await axios.post(
        `${API_BASE_URL}/like/like`,
        { likedId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { message, alreadyLiked, match } = res.data;

      if (alreadyLiked) {
        Alert.alert("Thông báo", message || "Bạn đã thả tim người này rồi.");
      } else if (match) {
        Alert.alert("🎉 Match!", "Hai bạn đã match thành công!");
      } else {
        Alert.alert("❤️ Thành công", message || "Bạn đã thả tim người này.");
      }

      setIsLiked(true);
    } catch (err) {
      console.error("Like error:", err.response?.data || err.message);
      if (err.response?.status === 403) {
        Alert.alert("Giới hạn", "Bạn đã đạt giới hạn 5 lượt like hôm nay.");
      } else if (err.response?.status === 400) {
        Alert.alert("Lỗi", "Bạn không thể thả tim cho chính mình.");
      } else {
        Alert.alert("Lỗi", "Không thể gửi like.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatAlbumData = (data, numColumns) => {
    const newData = [...data];
    const fullRows = Math.floor(newData.length / numColumns);
    let lastRowItems = newData.length - fullRows * numColumns;
    while (lastRowItems !== 0 && lastRowItems !== numColumns) {
      newData.push({ id: `empty-${lastRowItems}`, empty: true });
      lastRowItems++;
    }
    return newData;
  };

  const renderAlbumItem = ({ item }) => {
    if (item.empty) return <View style={{ flex: 1, margin: ITEM_MARGIN }} />;
    return (
      <TouchableOpacity
        style={{ flex: 1, margin: ITEM_MARGIN }}
        onPress={() => {
          setSelectedImage(item);
          setShowModal(true);
        }}
      >
        <Image
          source={{ uri: item }}
          style={{
            width: ITEM_SIZE,
            height: ITEM_SIZE,
            borderRadius: 12,
          }}
        />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#ff3366" />
        </TouchableOpacity>
        <Text style={styles.username}>Hồ sơ</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.profileInfo}>
        {/* ✅ Avatar + Badge */}
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: user.avatar_url || "https://via.placeholder.com/80" }}
            style={styles.avatar}
          />
          {user?.is_premium === 1 && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>

        <Text style={styles.name}>
  {user.name}, {user.age || "?"}
</Text>

{/* ✅ Thêm dòng hiển thị Gender ngay đây */}
<Text style={styles.gender}>
  {user.gender === "male"
    ? "Nam"
    : user.gender === "female"
    ? "Nữ"
    : "Không xác định"}
</Text>

       
        <Text style={styles.bio}>{user.bio || "Chưa có tiểu sử."}</Text>
        <Text style={styles.location}>{user.location || "Chưa có địa chỉ"}</Text>

        {user.interests?.length > 0 ? (
          <View style={styles.interestsContainer}>
            {user.interests.map((item) => (
              <Text key={item.id} style={styles.interestItem}>
                {item.icon ? `${item.icon} ` : ""}
                {item.name}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.interest}>Chưa có sở thích</Text>
        )}

        {/* ❤️ Nút Like */}
        <TouchableOpacity
          style={[styles.likeButton, isLiked && { backgroundColor: "#ff99bb" }]}
          onPress={handleLike}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="heart" size={26} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.albumIconContainer}>
        <Text style={styles.albumText}>Album</Text>
      </View>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={formatAlbumData(user.photos || [], NUM_COLUMNS)}
        renderItem={renderAlbumItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 80,
          paddingHorizontal: ITEM_MARGIN,
        }}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
      />

      {/* ✅ Modal ảnh full */}
      <Modal visible={showModal} transparent={true}>
        <View style={modalStyles.modalBackground}>
          <TouchableOpacity
            style={modalStyles.closeButton}
            onPress={() => setShowModal(false)}
          >
            <Ionicons name="close" size={40} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={modalStyles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  username: { fontSize: 22, fontWeight: "bold", color: "#ff3366" },
  profileInfo: {
    backgroundColor: "#ffe9e9ff",
    margin: 20,
    marginTop: 30,
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  avatarWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: "#ff3366",
  },
  premiumBadge: {
    position: "absolute",
    top: -30,
    alignSelf: "center",
    backgroundColor: "#ff3366",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 4,
  },
  premiumText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  name: { fontSize: 20, fontWeight: "700", color: "#333", marginBottom: 5 },
  bio: { fontSize: 14, color: "#555", marginBottom: 5, textAlign: "center" },
  location: { fontSize: 14, color: "#000", marginBottom: 10 },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 8,
    justifyContent: "center",
  },
  interestItem: {
    backgroundColor: "#fbd4e3ff",
    color: "#ff3366",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    margin: 4,
    fontSize: 13,
  },
  interest: { fontSize: 14, color: "#999", marginVertical: 8 },
  likeButton: {
    backgroundColor: "#ff3366",
    padding: 14,
    borderRadius: 50,
    marginTop: 10,
  },
  albumIconContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  albumText: { fontSize: 18, color: "#ff3366", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

const modalStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: { position: "absolute", top: 40, right: 20, zIndex: 2 },
  fullImage: { width: "90%", height: "70%" },
});
