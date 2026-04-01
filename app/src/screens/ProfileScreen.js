import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL, CLOUDINARY_URL, CLOUDINARY_UPLOAD_PRESET } from '@env';
import styles from '../styles/ProfileScreen.styles';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_MARGIN = 4;
const ITEM_SIZE = (width - ITEM_MARGIN * (NUM_COLUMNS * 2)) / NUM_COLUMNS;

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [album, setAlbum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ==============================
  // 1. FETCH PROFILE (FIX ĐIỂM 0)
  // ==============================
  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawUser = response.data.user || {};
      
      // Ép kiểu popularity_score về số để tránh lỗi hiển thị '0'
      const validatedScore = Number(rawUser.popularity_score) || 0;

      setUser({
        ...rawUser,
        popularity_score: validatedScore
      });

      if (rawUser.photos) {
        setAlbum([...rawUser.photos].sort((a, b) => b.id - a.id));
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  // ==============================
  // 2. LOGIC THÊM ẢNH (FIX THƯ VIỆN + DETECT VAPE)
  // ==============================
  const handleAddAlbumPhoto = async () => {
    // Xin quyền truy cập
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Quyền truy cập", "Vui lòng cho phép truy cập thư viện để đăng ảnh.");
      return;
    }

    // Mở thư viện
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.length) return;

    const imageUri = result.assets[0].uri;
    setUploading(true);

    try {
      // 1. Detect Vape trước khi upload
      const detectForm = new FormData();
      detectForm.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "detect.jpg",
      });

      const detectRes = await axios.post(
        `${API_BASE_URL}/detect/vape`,
        detectForm,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (detectRes.data.detected) {
        Alert.alert("Ảnh chứa Vape!", "Không được phép upload ảnh chứa vape.");
        return;
      }

      // 2. Upload lên Cloudinary
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "album.jpg",
      });
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const cloudRes = await axios.post(CLOUDINARY_URL, formData);
      const imageUrl = cloudRes.data.secure_url;

      // 3. Lưu vào Database của bạn
      const token = await AsyncStorage.getItem("token");
      const apiRes = await axios.post(
        `${API_BASE_URL}/users/add-album-photo`,
        { photo_url: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 4. Cập nhật giao diện ngay lập tức
      if (apiRes.data.photo) {
        setAlbum(prev => [apiRes.data.photo, ...prev]);
        Alert.alert("Thành công", "Đã thêm ảnh mới!");
      }
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Lỗi", "Không thể tải ảnh lên.");
    } finally {
      setUploading(false);
    }
  };

  // ==============================
  // 3. LOGIC ĐỔI AVATAR
  // ==============================
  const pickAndUploadAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert(
        "Lỗi",
        "Cần cấp quyền để chọn ảnh.",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Cài đặt", onPress: () => Linking.openSettings() },
        ]
      );
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) return;

    const imageUri = result.assets[0].uri;
    setUploading(true);

    try {
      // Upload Cloudinary
      const formData = new FormData();
      formData.append("file", { uri: imageUri, type: "image/jpeg", name: "avatar.jpg" });
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const cloudRes = await axios.post(CLOUDINARY_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const imageUrl = cloudRes.data.secure_url;

      // Update DB
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/users/update-avatar`,
        { avatar_url: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update UI ngay lập tức
      setUser(prev => ({ ...prev, avatar_url: imageUrl }));

      Alert.alert("Thành công", "Đổi ảnh đại diện thành công!");
    } catch (err) {
      console.error("Avatar error:", err);
      Alert.alert("Lỗi", "Không thể đổi ảnh đại diện.");
    } finally {
      setUploading(false);
    }
  };

  // ==============================
  // 4. RENDER UI
  // ==============================
  const renderHeader = () => (
    <View style={{ backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Text style={styles.username}>𝒯 𝓌 𝑜 𝓈 𝑒 𝓉</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={25} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={localStyles.profileCard}>
        <View style={localStyles.avatarWrapper}>
          {user?.is_premium === 1 && (
            <View style={localStyles.premiumTag}>
              <Text style={localStyles.premiumText}>Premium</Text>
            </View>
          )}
          <Image
            source={{ uri: user?.avatar_url || "https://via.placeholder.com/150" }}
            style={styles.avatar}
          />
        </View>

        <Text style={styles.name}>{user?.name}</Text>

        {/* Điểm nổi bật - Đã fix hiển thị */}
        <View style={localStyles.scoreContainer}>
          <MaterialIcons name="stars" size={20} color="#ff3366" />
          <Text style={localStyles.scoreText}>
             Điểm nổi bật: {user?.popularity_score ?? 0}
          </Text>
        </View>

        <Text style={styles.bio}>{user?.bio || "Chưa có mô tả"}</Text>
        
        <View style={localStyles.infoRow}>
            <Text style={styles.age}>{user?.age ? `${user.age} tuổi` : ""}</Text>
            {user?.gender && <Text style={styles.gender}> • {user.gender}</Text>}
            {user?.location && <Text style={styles.location}> • {user.location}</Text>}
        </View>

        <View style={styles.interestsContainer}>
          {user?.interests?.map((item, index) => (
            <Text key={item.id || index} style={styles.interestItem}>
              {item.icon} {item.name}
            </Text>
          ))}
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            Alert.alert("Chỉnh sửa", "", [
              { text: "Đổi Avatar", onPress: pickAndUploadAvatar },
              { text: "Cập nhật thông tin", onPress: () => navigation.navigate("EditProfile") },
              { text: "Hủy", style: "cancel" },
            ])
          }
        >
          <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.albumIconContainer}>
        <Text style={styles.albumText}>Album ảnh</Text>
        {/* FIX: Gắn hàm handleAddAlbumPhoto vào onPress */}
        <TouchableOpacity onPress={handleAddAlbumPhoto} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator size="small" color="#ff3366" />
          ) : (
            <MaterialIcons name="add-a-photo" size={26} color="#ff3366" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#ff3366" style={{flex:1}} />;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={album}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={{ margin: ITEM_MARGIN }}
            onPress={() => { setSelectedImage(item.photo_url); setShowModal(true); }}
          >
            <Image 
              source={{ uri: item.photo_url }} 
              style={{ width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: 8 }} 
            />
          </TouchableOpacity>
        )}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showModal} transparent animationType="fade">
        <View style={localStyles.modalBg}>
          <TouchableOpacity style={localStyles.closeBtn} onPress={() => setShowModal(false)}>
            <Ionicons name="close-circle" size={45} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={localStyles.fullImg} resizeMode="contain" />
        </View>
      </Modal>
    </View>
  );
};

const localStyles = StyleSheet.create({
  profileCard: { alignItems: 'center', paddingHorizontal: 20 },
  avatarWrapper: { position: 'relative', marginTop: 10, marginBottom: 10 },
  premiumTag: {
    position: 'absolute', top: -12, alignSelf: 'center',
    backgroundColor: '#FFD700', paddingHorizontal: 12, paddingVertical: 2,
    borderRadius: 12, zIndex: 10, borderWidth: 2, borderColor: '#fff',
  },
  premiumText: { fontSize: 11, fontWeight: 'bold', color: '#000' },
  scoreContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F3',
    paddingHorizontal: 18, paddingVertical: 6, borderRadius: 25, marginVertical: 10,
    borderWidth: 1, borderColor: '#ffccd5'
  },
  scoreText: { color: '#ff3366', fontWeight: 'bold', fontSize: 16, marginLeft: 6 },
  infoRow: { flexDirection: 'row', marginVertical: 5 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullImg: { width: '95%', height: '80%' },
  closeBtn: { position: 'absolute', top: 50, right: 30, zIndex: 20 }
});

export default ProfileScreen;