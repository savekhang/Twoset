import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import { API_BASE_URL } from '@env';
import styles from '../styles/SearchScreen.styles';

export default function SearchScreen({ navigation }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState(null);
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [locationId, setLocationId] = useState(null);
  const [results, setResults] = useState([]);

  // Dropdown control
  const [openGender, setOpenGender] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);

  const [locationOptions, setLocationOptions] = useState([]);

  // Lấy danh sách location từ API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/locations`);
        setLocationOptions(
          res.data.map((loc) => ({
            label: loc.name,
            value: loc.id,
          }))
        );
      } catch (err) {
        console.error('❌ Lỗi khi tải địa điểm:', err.message);
        Alert.alert('Lỗi', 'Không thể tải danh sách vị trí.');
      }
    };
    fetchLocations();
  }, []);

  // Hàm xử lý tìm kiếm
  const handleSearch = async () => {
    try {
      if (!name.trim() && !gender && !minAge.trim() && !maxAge.trim() && !locationId) {
        return Alert.alert('Thiếu thông tin', 'Vui lòng nhập ít nhất một thông tin tìm kiếm.');
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Lỗi', 'Bạn chưa đăng nhập!');

      const body = {
        name: name || undefined,
        gender: gender || undefined,
        minAge: minAge ? parseInt(minAge) : undefined,
        maxAge: maxAge ? parseInt(maxAge) : undefined,
        location_id: locationId ? parseInt(locationId) : undefined,
      };

      const res = await axios.post(`${API_BASE_URL}/users/search`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResults(res.data.users);
    } catch (err) {
      console.error('❌ Search error:', err.response?.data || err.message);
      Alert.alert('Lỗi', 'Không thể tìm kiếm người dùng.');
    }
  };

  // 👤 Khi click vào kết quả → gọi API chi tiết và điều hướng sang UserProfileScreen
  const handleViewProfile = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/users/userProfile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data.profile) {
        return Alert.alert('Thông báo', 'Không tìm thấy hồ sơ người dùng.');
      }

      navigation.navigate('UserProfile', { user: res.data.profile });
    } catch (err) {
      console.error('❌ View profile error:', err.response?.data || err.message);
      Alert.alert('Lỗi', 'Không thể tải hồ sơ người dùng.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tìm kiếm người dùng</Text>

      <TextInput
        placeholder="Tên"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Text style={styles.label}>Giới tính:</Text>
      <DropDownPicker
        open={openGender}
        setOpen={setOpenGender}
        value={gender}
        setValue={setGender}
        items={[
          { label: 'Nam', value: 'male' },
          { label: 'Nữ', value: 'female' },
          { label: 'Khác', value: 'other' },
        ]}
        placeholder="-- Chọn giới tính --"
        containerStyle={{ marginBottom: 15 }}
        zIndex={2000}
        listMode="SCROLLVIEW"
      />

      <View style={styles.row}>
        <TextInput
          placeholder="Tuổi từ"
          placeholderTextColor="#999"
          value={minAge}
          onChangeText={setMinAge}
          keyboardType="numeric"
          style={[styles.inputHalf, styles.marginRight]}
        />
        <TextInput
          placeholder="Đến"
          placeholderTextColor="#999"
          value={maxAge}
          onChangeText={setMaxAge}
          keyboardType="numeric"
          style={styles.inputHalf}
        />
      </View>

      <Text style={styles.label}>Vị trí:</Text>
      <DropDownPicker
        open={openLocation}
        setOpen={setOpenLocation}
        value={locationId}
        setValue={setLocationId}
        items={locationOptions}
        placeholder="-- Chọn địa điểm --"
        containerStyle={{ marginBottom: 20 }}
        zIndex={1000}
        listMode="SCROLLVIEW"
      />

      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Tìm kiếm</Text>
      </TouchableOpacity>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleViewProfile(item.id)} // ✅ Thêm điều hướng tại đây
          >
            <Image
              source={{ uri: item.avatar_url || 'https://via.placeholder.com/60' }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userDetail}>
                {item.age} tuổi • {item.location_name || 'Không rõ'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy người dùng.</Text>}
      />
    </View>
  );
}
