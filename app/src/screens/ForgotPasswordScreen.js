import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/ForgotPassword.styles.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }
    try {
      console.log("Forgot password API:", `${API_BASE_URL}/auth/forgot-password`);
      const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });

      console.log("Server response:", res.data);

      if (res.data.success) {
        await AsyncStorage.setItem('reset_email', email); // 🔹 lưu email tạm
        Alert.alert('Thành công', 'Mã PIN đã được gửi tới email của bạn');
        navigation.navigate('ResetPassword'); 
      } else {
        Alert.alert('Lỗi', res.data.message || 'Không thể gửi mã PIN');
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      if (error.response) {
        Alert.alert('Lỗi', error.response.data.message || 'Máy chủ trả lỗi');
      } else {
        Alert.alert('Lỗi', 'Không thể kết nối máy chủ');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập email của bạn"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
        <Text style={styles.buttonText}>Xác nhận</Text>
      </TouchableOpacity>
    </View>
  );
}
