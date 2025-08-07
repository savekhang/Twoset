import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, CLOUDINARY_URL, CLOUDINARY_UPLOAD_PRESET } from '@env';
import styles from '../styles/UploadAvatarScreen.styles';

const UploadAvatarScreen = ({ navigation }) => {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('CLOUDINARY_URL:', CLOUDINARY_URL);
  console.log('CLOUDINARY_UPLOAD_PRESET:', CLOUDINARY_UPLOAD_PRESET);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('Permission status:', status);
    if (status !== 'granted') {
      Alert.alert(
        'Lỗi',
        'Cần cấp quyền truy cập thư viện ảnh để chọn ảnh. Vui lòng cấp quyền trong cài đặt.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Mở cài đặt', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    console.log('ImagePicker result:', result);
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async () => {
    if (!imageUri) {
      return Alert.alert('Lỗi', 'Vui lòng chọn một ảnh trước khi tải lên.');
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await axios.post(CLOUDINARY_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Cloudinary response:', res.data);
      const imageUrl = res.data.secure_url;
      await saveToServer(imageUrl);
    } catch (err) {
      console.error('Lỗi tải ảnh lên Cloudinary:', err.message);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên Cloudinary. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const saveToServer = async (url) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token);
      if (!token) {
        throw new Error('Không tìm thấy token đăng nhập.');
      }

      console.log('Calling API:', `${API_BASE_URL}/users/update-avatar`);

      const res = await axios.post(
        `${API_BASE_URL}/users/update-avatar`,
        { avatar_url: url },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Server response:', res.data);
      Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công.');
      navigation.navigate('Home');
    } catch (err) {
      console.error('Lỗi lưu ảnh đại diện lên server:', err.message);
      let errorMessage = 'Không thể cập nhật ảnh đại diện lên server.';
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Không tìm thấy endpoint API. Vui lòng kiểm tra cấu hình server.';
        } else if (err.response.status === 401) {
          errorMessage = 'Token không hợp lệ. Vui lòng đăng nhập lại.';
        } else if (err.response.status === 400) {
          errorMessage = 'Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại.';
        } else if (err.response.status === 500) {
          errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
        }
      } else {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.';
      }
      Alert.alert('Lỗi', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tải lên ảnh đại diện</Text>
      <TouchableOpacity
        style={styles.imageBox}
        onPress={() => {
          console.log('TouchableOpacity pressed');
          pickImage();
        }}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>Chạm để chọn ảnh</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.uploadBtn} onPress={uploadToCloudinary} disabled={loading}>
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