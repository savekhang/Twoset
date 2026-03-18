import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, CLOUDINARY_URL, CLOUDINARY_UPLOAD_PRESET } from '@env';
import styles from '../styles/UploadAvatarScreen.styles';

const UploadAvatarScreen = ({ navigation, route }) => {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const email = route?.params?.email;
  console.log("📩 EMAIL FROM VERIFY:", email);

  if (!email) {
    console.warn("⚠️ Không có email trong route params!");
  }

  // PICK IMAGE
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Lỗi',
        'Bạn cần cấp quyền truy cập thư viện ảnh.',
        [
          { text: 'Hủy' },
          { text: 'Mở cài đặt', onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // fix deprecated
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // UPLOAD CLOUDINARY
  const uploadToCloudinary = async () => {
    if (!imageUri) return Alert.alert('Lỗi', 'Vui lòng chọn ảnh trước.');
    if (!email) return Alert.alert('Lỗi', 'Thiếu email. Quay lại Verify.');

    setLoading(true);
    const formData = new FormData();

    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    });

    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await axios.post(CLOUDINARY_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await saveToServer(res.data.secure_url);

    } catch (err) {
      console.error("Cloudinary error:", err);
      Alert.alert("Lỗi", "Upload ảnh thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // SAVE TO SERVER → TẠO TOKEN GIỐNG LOGIN
  const saveToServer = async (imageUrl) => {
  try {
    // 1) Upload avatar to server
    const avatarRes = await axios.post(`${API_BASE_URL}/users/upload-avatar`, {
      email,
      avatar_url: imageUrl
    });

    console.log("✅ Avatar updated:", avatarRes.data);

    // 2) Create token (login-after-verify)
    const loginRes = await axios.post(`${API_BASE_URL}/auth/login-after-verify`, {
      email
    });

    const { token, user } = loginRes.data;

    if (!token || !user) {
      throw new Error("Token hoặc user không hợp lệ từ API login-after-verify.");
    }

    // 3) Save token + user
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));

    console.log("🔐 Token saved:", token);
    console.log("👤 User saved:", user);

    // 4) Điều hướng về Home ngay lập tức
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }]
    });

  } catch (err) {
    console.error("❌ Server error:", err);

    Alert.alert(
      "Lỗi",
      err.response?.data?.message || "Không thể lưu avatar hoặc tạo token."
    );
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tải lên ảnh đại diện</Text>

      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>Chạm để chọn ảnh</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.uploadBtn}
        onPress={uploadToCloudinary}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.uploadText}>Tải lên</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default UploadAvatarScreen;
