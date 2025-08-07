import React from 'react';
import { API_BASE_URL } from '@env';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import styles from '../styles/HomeScreen.styles';
import { Linking } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const ads = [
    {
      id: 1,
      image: require('../../assets/ads/ads_1.jpg'),
      type: 'link',
      link: 'https://www.youtube.com/watch?v=2_04SN58vJY&list=RD2_04SN58vJY&start_radio=1',
    },
    {
      id: 2,
      image: require('../../assets/ads/ads_2.jpg'),
      type: 'qr',
    },
  ];

  const handleAdPress = async (ad) => {
    if (ad.type === 'link') {
      Linking.openURL(ad.link);
    } else if (ad.type === 'qr') {
      try {
        const res = await axios.get(`${API_BASE_URL}/qr/generate`);
        const { qrDataURL, qrCode } = res.data;
        navigation.navigate('QrScreen', { qrDataURL, qrCode });
      } catch (error) {
        console.error(error);
        Alert.alert('Lỗi', 'Không lấy được QR');
      }
    }
  };

  const handleUpgradePremium = () => {
  navigation.navigate('Payment');
};


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>𝒯 𝓌 𝑜 𝓈 𝑒 𝓉</Text>
        <View style={styles.icons}>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.adsContainer}>
        {ads.map((ad) => (
          <View key={ad.id}>
            <TouchableOpacity onPress={() => handleAdPress(ad)}>
              <Image source={ad.image} style={styles.adImage} />
            </TouchableOpacity>

            {ad.id === 2 && (
              <TouchableOpacity onPress={handleUpgradePremium}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: '#ff3366',
                    marginBottom: 12,
                    fontWeight: 'bold',
                  }}
                >
                  Nâng cấp Premium bằng Stripe
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Nearby')}>
          <FontAwesome name="map-marker" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Users')}>
          <Ionicons name="heart-outline" size={50} color="red" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Messages')}>
          <Ionicons name="chatbubble-outline" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
