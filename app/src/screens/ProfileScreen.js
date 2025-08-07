import React, { useState, useEffect } from 'react';
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
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL, CLOUDINARY_URL, CLOUDINARY_UPLOAD_PRESET } from '@env';
import styles from '../styles/ProfileScreen.styles';

const NUM_COLUMNS = 3;
const ITEM_MARGIN = 4; // khoảng cách giữa các ảnh
const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - ITEM_MARGIN * (NUM_COLUMNS * 2)) / NUM_COLUMNS;

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [album, setAlbum] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  // ====== Lấy profile + album ======
  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token đăng nhập.');

      const res = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);

      // Sắp xếp ảnh mới nhất lên đầu
      const sortedPhotos = (res.data.user.photos || []).sort((a, b) => b.id - a.id);

      setAlbum(sortedPhotos);
    } catch (err) {
      console.error('Lỗi lấy thông tin hồ sơ:', err.message);
      Alert.alert('Lỗi', 'Không thể tải thông tin hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ====== Upload ảnh Avatar ======
  const pickAndUploadAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để đổi avatar.', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Mở cài đặt', onPress: () => Linking.openSettings() },
      ]);
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
      const formData = new FormData();
      formData.append('file', { uri: imageUri, type: 'image/jpeg', name: 'avatar.jpg' });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const cloudRes = await axios.post(CLOUDINARY_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageUrl = cloudRes.data.secure_url;

      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/users/update-avatar`,
        { avatar_url: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công.');
      setUser((prev) => ({ ...prev, avatar_url: imageUrl }));
    } catch (err) {
      console.error('Lỗi đổi avatar:', err.message);
      Alert.alert('Lỗi', 'Không thể cập nhật ảnh đại diện.');
    } finally {
      setUploading(false);
    }
  };

  // ====== Upload ảnh vào Album ======
  const addAlbumPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để thêm vào album.', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Mở cài đặt', onPress: () => Linking.openSettings() },
      ]);
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) return;

    const imageUri = result.assets[0].uri;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', { uri: imageUri, type: 'image/jpeg', name: 'album.jpg' });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const cloudRes = await axios.post(CLOUDINARY_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageUrl = cloudRes.data.secure_url;

      const token = await AsyncStorage.getItem('token');
      const apiRes = await axios.post(
        `${API_BASE_URL}/users/add-album-photo`,
        { photo_url: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlbum((prev) => [{ id: apiRes.data.photo.id, uri: imageUrl }, ...prev]);
      Alert.alert('Thành công', 'Đã thêm ảnh vào album.');
    } catch (err) {
      console.error('Lỗi thêm ảnh album:', err.message);
      Alert.alert('Lỗi', 'Không thể thêm ảnh vào album.');
    } finally {
      setUploading(false);
    }
  };

  // ====== Xóa ảnh trong album ======
  const deletePhoto = async (photo) => {
    Alert.alert('Xóa ảnh', 'Bạn có chắc chắn muốn xóa ảnh này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/users/delete-album-photo/${photo.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setAlbum((prev) => prev.filter((p) => p.id !== photo.id));
          } catch (err) {
            console.error('Lỗi xóa ảnh:', err.message);
            Alert.alert('Lỗi', 'Không thể xóa ảnh.');
          }
        },
      },
    ]);
  };

  // ====== Hiển thị Alert chọn hành động chỉnh sửa hồ sơ ======
  const handleEditProfile = () => {
    Alert.alert(
      'Chỉnh sửa hồ sơ',
      'Bạn muốn thực hiện hành động nào?',
      [
        { text: 'Đổi ảnh đại diện', onPress: pickAndUploadAvatar },
        { text: 'Chỉnh sửa thông tin', onPress: () => navigation.navigate('EditProfile') },
        { text: 'Hủy', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // ====== Format album data để đủ 3 cột ======
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
          setSelectedImage(item.uri || item.photo_url);
          setShowModal(true);
        }}
        onLongPress={() => deletePhoto(item)}
      >
        <Image
          source={{ uri: item.uri || item.photo_url }}
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
        <Text style={styles.username}>𝒯 𝓌 𝑜 𝓈 𝑒 𝓉</Text>
        <TouchableOpacity style={styles.editButtonHeader} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={25} color="#000000ff" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        {user?.is_premium === 1 && <Text style={styles.premiumTag}>Premium</Text>}

        <Image
          source={{ uri: user?.avatar_url || 'https://via.placeholder.com/80' }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{user?.name || 'Tên người dùng'}</Text>
        <Text style={styles.bio}>{user?.bio || 'Chưa có thông tin tiểu sử.'}</Text>
        <Text style={styles.gender}>{user?.gender || 'Chưa rõ giới tính'}</Text>
        <Text style={styles.age}>{user?.age ? `${user.age} tuổi` : 'Chưa rõ tuổi'}</Text>
        <Text style={styles.location}>{user?.location || 'Chưa có địa chỉ'}</Text>

        {user?.interests?.length > 0 ? (
          <View style={styles.interestsContainer}>
            {user.interests.map((item) => (
              <Text key={item.id} style={styles.interestItem}>
                {item.icon ? `${item.icon} ` : ''}
                {item.name}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.interest}>Chưa có sở thích</Text>
        )}

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.albumIconContainer}>
        <Text style={styles.albumText}>Album</Text>
        <TouchableOpacity onPress={addAlbumPhoto} disabled={uploading} style={{ marginLeft: 10 }}>
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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        data={formatAlbumData(album, NUM_COLUMNS)}
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
        keyboardShouldPersistTaps="handled"
      />

      <Modal visible={showModal} transparent={true}>
        <View style={modalStyles.modalBackground}>
          <TouchableOpacity style={modalStyles.closeButton} onPress={() => setShowModal(false)}>
            <Ionicons name="close" size={40} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={modalStyles.fullImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
};

const modalStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
  },
  fullImage: {
    width: '90%',
    height: '70%',
  },
});

export default ProfileScreen;
