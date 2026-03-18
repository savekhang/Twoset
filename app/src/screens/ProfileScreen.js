import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
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

const NUM_COLUMNS = 3;
const ITEM_MARGIN = 4;
const { width } = Dimensions.get('window');
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
  // 🔥 FETCH PROFILE
  // ==============================
  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error("Token không tồn tại!");

      const res = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profile = res.data.user || {};

      // Sort ảnh mới nhất ở trên
      const sortedPhotos = (profile.photos || []).sort((a, b) => b.id - a.id);

      setUser(profile);
      setAlbum(sortedPhotos);

    } catch (err) {
      console.error("Fetch profile error:", err);
      Alert.alert("Lỗi", "Không thể tải thông tin hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  // Chạy khi mở màn hình lần đầu
  useEffect(() => {
    fetchProfile();
  }, []);

  // 🔥 Auto refresh khi quay lại màn hình
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );


  // ==============================
  // 🔥 Upload Avatar
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
      mediaTypes: ['images'],
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
  // 🔥 Add Album Photo
  // ==============================
  const addAlbumPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) return;

    const imageUri = result.assets[0].uri;
    setUploading(true);

    try {
      // 1. Detect Vape
      const detectForm = new FormData();
      detectForm.append("image", { uri: imageUri, type: "image/jpeg", name: "detect.jpg" });

      const detectRes = await axios.post(
        `${API_BASE_URL}/detect/vape`,
        detectForm,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (detectRes.data.detected) {
        Alert.alert("Ảnh chứa Vape!", "Không được phép upload.");
        return;
      }

      // 2. Upload Cloudinary
      const formData = new FormData();
      formData.append("file", { uri: imageUri, type: "image/jpeg", name: "album.jpg" });
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const cloudRes = await axios.post(CLOUDINARY_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const imageUrl = cloudRes.data.secure_url;

      // 3. Save to DB
      const token = await AsyncStorage.getItem("token");
      const apiRes = await axios.post(
        `${API_BASE_URL}/users/add-album-photo`,
        { photo_url: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 4. Update UI
      setAlbum(prev => [{ id: apiRes.data.photo.id, photo_url: imageUrl }, ...prev]);

      Alert.alert("Thành công", "Đã thêm ảnh vào album!");
    } catch (err) {
      console.error("Add album error:", err);
      Alert.alert("Lỗi", "Không thể thêm ảnh vào album.");
    } finally {
      setUploading(false);
    }
  };


  // ==============================
  // 🔥 Delete Album Photo
  // ==============================
  const deletePhoto = (photo) => {
    Alert.alert(
      "Xóa ảnh?",
      "Bạn có chắc muốn xóa?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.delete(`${API_BASE_URL}/users/delete-album-photo/${photo.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              setAlbum(prev => prev.filter(p => p.id !== photo.id));
            } catch (err) {
              console.error("Delete error:", err);
              Alert.alert("Lỗi", "Không thể xóa ảnh.");
            }
          },
        },
      ]
    );
  };


  // ==============================
  // 🔥 UI Components
  // ==============================
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

    const img = item.photo_url || item.uri;

    return (
      <TouchableOpacity
        style={{ flex: 1, margin: ITEM_MARGIN }}
        onPress={() => {
          setSelectedImage(img);
          setShowModal(true);
        }}
        onLongPress={() => deletePhoto(item)}
      >
        <Image
          source={{ uri: img }}
          style={{ width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: 12 }}
        />
      </TouchableOpacity>
    );
  };


  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.username}>𝒯 𝓌 𝑜 𝓈 𝑒 𝓉</Text>

        <TouchableOpacity
          style={styles.editButtonHeader}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={25} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        {user?.is_premium === 1 && <Text style={styles.premiumTag}>Premium</Text>}

        <Image
          source={{ uri: user?.avatar_url || "https://via.placeholder.com/80" }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.bio}>{user?.bio || "Chưa có mô tả"}</Text>
        <Text style={styles.gender}>{user?.gender}</Text>
        <Text style={styles.age}>{user?.age ? `${user.age} tuổi` : "Chưa rõ tuổi"}</Text>
        <Text style={styles.location}>{user?.location || "Chưa có địa chỉ"}</Text>

        {/* Sở thích */}
        {user?.interests?.length > 0 ? (
          <View style={styles.interestsContainer}>
            {user.interests.map(item => (
              <Text key={item.id} style={styles.interestItem}>
                {item.icon ? `${item.icon} ` : ""}{item.name}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.interest}>Chưa có sở thích</Text>
        )}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            Alert.alert("Chỉnh sửa", "", [
              { text: "Đổi Avatar", onPress: pickAndUploadAvatar },
              { text: "Chỉnh sửa Info", onPress: () => navigation.navigate("EditProfile") },
              { text: "Hủy", style: "cancel" },
            ])
          }
        >
          <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.albumIconContainer}>
        <Text style={styles.albumText}>Album</Text>

        <TouchableOpacity onPress={addAlbumPhoto} disabled={uploading}>
          <MaterialIcons name="add-circle" size={36} color="#ff3366" />
        </TouchableOpacity>
      </View>
    </>
  );


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff3366" />
      </View>
    );
  }


  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={formatAlbumData(album, NUM_COLUMNS)}
        renderItem={renderAlbumItem}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showModal} transparent animationType="fade">
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
};


const modalStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 2,
  },
  fullImage: {
    width: "90%",
    height: "70%",
  },
});

export default ProfileScreen;
