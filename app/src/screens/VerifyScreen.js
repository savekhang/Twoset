import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import styles from '../styles/VerifyScreen.styles';
import axios from 'axios';
import { API_BASE_URL } from '@env';

export default function VerifyScreen({ route, navigation }) {
  const email = route?.params?.email || ''; // Lấy email từ bước đăng ký
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Thiếu thông tin email, vui lòng quay lại bước trước.');
      return;
    }

    if (!code.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã xác thực.');
      return;
    }

    try {
      setLoading(true);

      // Gọi đúng API xác thực mã
      const res = await axios.post(`${API_BASE_URL}/auth/verify`, {
        email,
        code,
      });

      const message = res.data?.message || '';

      if (message.toLowerCase().includes('success')) {
        Alert.alert('Thành công', 'Tài khoản của bạn đã được xác thực!', [
          { 
            text: 'Tiếp tục', 
            onPress: () =>
              navigation.replace('UploadAvatar', {
                email: email,     // 🔥 TRUYỀN EMAIL SANG UPLOADAVATAR SCREEN
              })
          },
        ]);
      } else {
        Alert.alert('Lỗi', message || 'Mã xác thực không hợp lệ.');
      }

    } catch (err) {
      console.error('Verify error:', err);
      Alert.alert(
        'Lỗi',
        err.response?.data?.message || 'Không thể xác thực. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Xác minh tài khoản</Text>
        <Text style={styles.subtitle}>
          Nhập mã xác thực được gửi đến email của bạn
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập mã xác thực"
          placeholderTextColor="#999"
          value={code}
          onChangeText={setCode}
          keyboardType="default"
          maxLength={8}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Xác nhận</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
