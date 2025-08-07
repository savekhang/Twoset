import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, Alert } from 'react-native';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function PaymentScreen() {
  const navigation = useNavigation();

  const getCheckoutSession = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/payments/stripe/create-session`, // ✅ Sửa lại đúng route
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );


      const redirectUrl = Linking.createURL('success');// twoset://success

      const result = await WebBrowser.openAuthSessionAsync(res.data.url, redirectUrl);

      if (result.type === 'success' && result.url.includes('success')) {
        navigation.replace('Success');
      } else if (result.type === 'cancel') {
        Alert.alert('❌ Hủy', 'Bạn đã hủy thanh toán');
        navigation.goBack();
      }
    } catch (err) {
      console.error('Lỗi khi tạo checkout session:', err);
      Alert.alert('Lỗi', 'Không thể tạo phiên thanh toán');
      navigation.goBack();
    }
  };

  useEffect(() => {
    getCheckoutSession();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text>Đang mở trang thanh toán...</Text>
    </View>
  );
}
