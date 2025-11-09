import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/ForgotPassword.styles'; // dùng lại style đồng nhất

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [email, setEmail] = useState('');

  // 🔹 Lấy email đã lưu sau bước Forgot Password
  useEffect(() => {
    const loadEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('reset_email');
        if (savedEmail) setEmail(savedEmail);
      } catch (err) {
        console.error('Lỗi khi load email từ AsyncStorage:', err);
      }
    };
    loadEmail();
  }, []);

  const handleResetPassword = async () => {
    if (!resetCode || !newPassword) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mã PIN và mật khẩu mới.');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        email,
        resetCode,
        newPassword,
      });

      // ✅ Kiểm tra theo message vì backend không có "success: true"
      if (res.data.message === 'Password has been reset successfully') {
        // ✅ Xóa email lưu tạm
        await AsyncStorage.removeItem('reset_email');

        // ✅ Hiển thị thông báo và điều hướng về trang Login
        Alert.alert(
          'Thành công',
          'Mật khẩu đã được đổi thành công!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Lỗi', res.data.message || 'Không thể đặt lại mật khẩu.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể kết nối máy chủ.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt lại mật khẩu</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập mã PIN (đã gửi email)"
        value={resetCode}
        onChangeText={setResetCode}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Xác nhận</Text>
      </TouchableOpacity>
    </View>
  );
}
