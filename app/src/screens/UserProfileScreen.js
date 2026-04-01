import React, { useState, useEffect, useCallback } from "react";
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
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 3;
const ITEM_MARGIN = 4;
const ITEM_SIZE = (width - ITEM_MARGIN * (NUM_COLUMNS * 2)) / NUM_COLUMNS;

export default function UserProfileScreen({ route, navigation }) {
  const { user: initialUser } = route.params; 
  
  const [userData, setUserData] = useState(initialUser); // Lưu data user đầy đủ
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // States cho Quà tặng
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [gifts, setGifts] = useState([]);
  const [loadingGifts, setLoadingGifts] = useState(false);

  // ==============================
  // 🔄 FETCH LẠI DATA MỚI NHẤT
  // ==============================
  const fetchLatestProfile = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      // Giả sử bạn có route lấy profile chi tiết: /users/:id hoặc tương tự
      const res = await axios.get(`${API_BASE_URL}/users/${initialUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setUserData(res.data);
      }
    } catch (err) {
      console.log("Không thể fetch profile mới, sử dụng data cũ từ params");
    }
  }, [initialUser.id]);

  useEffect(() => {
    fetchLatestProfile();
  }, [fetchLatestProfile]);

  // ==============================
  // 🎁 LOGIC QUÀ TẶNG
  // ==============================
  const fetchGifts = async () => {
    try {
      setLoadingGifts(true);
      setShowGiftModal(true);
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/gifts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGifts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách quà tặng.");
    } finally {
      setLoadingGifts(false);
    }
  };

  const handleSendGift = (gift) => {
    Alert.alert(
      "Xác nhận tặng quà",
      `Tặng ${gift.icon} ${gift.name} (${gift.price} xu)?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Tặng", 
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const res = await axios.post(`${API_BASE_URL}/send-gift`, {
                receiver_id: userData.id,
                gift_id: gift.id
              }, { headers: { Authorization: `Bearer ${token}` } });

              Alert.alert("Thành công! 🎁", res.data.message);
              setShowGiftModal(false);
              
              // Sau khi tặng thành công, gọi lại hàm fetch để cập nhật popularity_score từ DB
              fetchLatestProfile();
            } catch (err) {
              Alert.alert("Thông báo", err.response?.data?.message || "Lỗi giao dịch.");
            }
          }
        }
      ]
    );
  };

  const handleLike = async () => {
    try {
      setLoadingLike(true);
      const token = await AsyncStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/like/like`, { likedId: userData.id }, { headers: { Authorization: `Bearer ${token}` } });
      setIsLiked(true);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể thực hiện.");
    } finally {
      setLoadingLike(false);
    }
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#ff3366" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.profileCard}>
        {/* Nút quà tặng */}
        <TouchableOpacity style={styles.floatingGiftBtn} onPress={fetchGifts}>
          <MaterialIcons name="card-giftcard" size={28} color="#ff3366" />
        </TouchableOpacity>

        {/* Cấu trúc Avatar & Premium mới */}
        <View style={styles.avatarWrapper}>
          {userData.is_premium === 1 && (
            <View style={styles.premiumBadgeTop}>
              <MaterialIcons name="verified" size={14} color="#fff" />
              <Text style={styles.premiumTextTop}>Premium</Text>
            </View>
          )}
          <Image source={{ uri: userData.avatar_url || "https://via.placeholder.com/150" }} style={styles.avatar} />
        </View>

        <Text style={styles.nameText}>{userData.name}, {userData.age || "20"}</Text>

        {/* Popularity Score */}
        <View style={styles.popularityBadge}>
          <MaterialIcons name="stars" size={18} color="#ff3366" />
          <Text style={styles.popularityText}> Điểm nổi bật: {userData.popularity_score || 0}</Text>
        </View>

        <Text style={styles.genderText}>
          {userData.gender === "male" ? "Nam" : userData.gender === "female" ? "Nữ" : "Khác"}
        </Text>

        <Text style={styles.bioText}>{userData.bio || "Chưa có lời giới thiệu."}</Text>
        
        <View style={styles.locationInfo}>
           <Ionicons name="location-sharp" size={14} color="#666" />
           <Text style={styles.locationText}> {userData.location || "Việt Nam"}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.mainLikeBtn, isLiked && { backgroundColor: "#ff99bb" }]} 
          onPress={handleLike}
        >
          {loadingLike ? <ActivityIndicator color="#fff" /> : <Ionicons name="heart" size={30} color="#fff" />}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Khoảnh khắc</Text>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={userData.photos || []}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.photoThumbWrapper} 
            onPress={() => { setSelectedImage(item); setShowImageModal(true); }}
          >
            <Image source={{ uri: item }} style={styles.photoThumb} />
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        numColumns={NUM_COLUMNS}
        ListHeaderComponent={renderHeader}
        onRefresh={fetchLatestProfile}
        refreshing={refreshing}
      />

      {/* MODAL QUÀ TẶNG */}
      <Modal visible={showGiftModal} animationType="slide" transparent>
        <View style={styles.modalBlur}>
          <View style={styles.giftSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Gửi quà tặng</Text>
              <TouchableOpacity onPress={() => setShowGiftModal(false)}>
                <Ionicons name="close-circle" size={32} color="#ccc" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.giftGrid}>
              {gifts.map((gift) => (
                <TouchableOpacity key={gift.id} style={styles.giftCard} onPress={() => handleSendGift(gift)}>
                  <Text style={styles.giftEmoji}>{gift.icon}</Text>
                  <Text style={styles.giftNameText}>{gift.name}</Text>
                  <View style={styles.giftPriceContainer}>
                    <MaterialIcons name="monetization-on" size={14} color="#ffae00" />
                    <Text style={styles.giftPriceText}>{gift.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL XEM ẢNH */}
      <Modal visible={showImageModal} transparent={true}>
        <View style={styles.imageFullOverlay}>
          <TouchableOpacity style={styles.imageCloseBtn} onPress={() => setShowImageModal(false)}>
            <Ionicons name="close" size={40} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullSizeImg} resizeMode="contain" />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  
  profileCard: {
    backgroundColor: "#ffe9e9ff",
    margin: 20,
    borderRadius: 30,
    padding: 25,
    alignItems: "center",
    position: 'relative',
    elevation: 8,
    shadowColor: "#ff3366", shadowOpacity: 0.15, shadowOffset: { width: 0, height: 10 }, shadowRadius: 20,
  },
  
  floatingGiftBtn: {
    position: 'absolute',
    top: -15,
    right: 20,
    backgroundColor: '#fff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#ff3366',
  },

  // Avatar & Premium Badge Top
  avatarWrapper: { 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 15,
    marginTop: 10
  },
  avatar: { 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    borderWidth: 4, 
    borderColor: "#fff" 
  },
  premiumBadgeTop: { 
    position: "absolute", 
    top: -20, // Đặt lên phía trên avatar
    backgroundColor: "#ffae00", 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 }
  },
  premiumTextTop: { 
    color: "#fff", 
    fontSize: 12, 
    fontWeight: "bold",
    marginLeft: 4
  },

  nameText: { fontSize: 24, fontWeight: "bold", color: "#333" },
  popularityBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.8)', 
    paddingHorizontal: 15, 
    paddingVertical: 6, 
    borderRadius: 20, 
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fbd4e3ff'
  },
  popularityText: { fontSize: 14, fontWeight: '700', color: '#ff3366' },
  genderText: { fontSize: 15, color: "#ff3366", marginVertical: 5, fontWeight: "600" },
  bioText: { fontSize: 14, color: "#666", textAlign: "center", lineHeight: 20, paddingHorizontal: 10 },
  locationInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  locationText: { fontSize: 13, color: "#666" },
  mainLikeBtn: { backgroundColor: "#ff3366", padding: 16, borderRadius: 40, marginTop: 20, width: 70, height: 70, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 20, marginTop: 20, marginBottom: 10, color: '#333' },
  photoThumbWrapper: { flex: 1, margin: ITEM_MARGIN },
  photoThumb: { width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: 15 },
  modalBlur: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  giftSheet: { backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 25, maxHeight: '80%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 22, fontWeight: 'bold' },
  giftGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  giftCard: { width: '31%', backgroundColor: '#fff5f7', borderRadius: 20, padding: 10, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#ffe0e9' },
  giftEmoji: { fontSize: 35, marginBottom: 5 },
  giftNameText: { fontSize: 11, fontWeight: 'bold', color: '#555' },
  giftPriceContainer: { flexDirection: 'row', alignItems: 'center' },
  giftPriceText: { fontSize: 12, color: '#ffae00', fontWeight: 'bold' },
  imageFullOverlay: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  imageCloseBtn: { position: "absolute", top: 50, right: 25, zIndex: 10 },
  fullSizeImg: { width: "100%", height: "80%" },
});