import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SuccessScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    // Gửi request lên backend xác nhận
    // hoặc gọi API cập nhật `is_premium` nếu cần

    // Có thể hiển thị thông báo hoặc redirect
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Thanh toán thành công! 🎉</Text>
    </View>
  );
}
