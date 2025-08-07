import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../styles/LoginScreen.styles'; // Dùng chung với Login

const VerifyScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [code, setCode] = useState('');
  const email = route.params?.email;

  console.log('API_BASE_URL:', API_BASE_URL); // Debug API_BASE_URL
  console.log('Email received:', email); // Debug email

  const handleVerify = async () => {
    if (!code || !email) {
      return Alert.alert('Lỗi', 'Vui lòng nhập mã xác minh và email');
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/verify`, {
        email,
        code,
      });

      const { token } = res.data;
      await AsyncStorage.setItem('token', token); // Lưu token vào AsyncStorage
      console.log('Token saved:', token); // Debug token

      Alert.alert('Thành công', res.data.message || 'Xác minh tài khoản thành công');
      navigation.navigate('UploadAvatar', { email });
    } catch (err) {
      console.error('❌ Lỗi xác minh:', err.response?.data || err.message);
      Alert.alert('Xác minh thất bại', err.response?.data?.message || 'Đã có lỗi xảy ra');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>𝒯 𝓌 𝑜 𝓈 𝑒 𝓉</Text>
      <Text style={styles.slogan}>Nhập mã xác minh được gửi đến email của bạn</Text>

      <TextInput
        placeholder="Mã xác minh"
        placeholderTextColor="#666"
        style={styles.input}
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
      />

      <TouchableOpacity onPress={handleVerify}>
        <Text style={styles.loginBtn}>Xác minh</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyScreen;