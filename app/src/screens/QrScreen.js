import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from '../styles/QrScreen.styles';

export default function QrScreen({ route }) {
  const { qrDataURL } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>𝒯 𝓌 𝑜 𝓈 𝑒 𝓉</Text>
      </View>

      <View style={styles.qrWrapper}>
        <Text style={styles.priceText}>Thanh toán: 100.000đ</Text>
        <Image source={{ uri: qrDataURL }} style={styles.qrImage} />
        <Text style={styles.noteText}>
          Quét mã để nâng cấp tài khoản Premium{'\n'}Tài khoản sẽ được kích hoạt sau khi thanh toán.
        </Text>
      </View>
    </View>
  );
}
