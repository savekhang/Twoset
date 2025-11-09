import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, Linking } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../app_api/apiClient";
import styles from "../styles/HomeScreen.styles";

export default function HomeScreen({ navigation }) {
  const [unreadCount, setUnreadCount] = useState(0);

  // Gọi API đếm thông báo chưa đọc
  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get(`/noti`);
      if (res.data && res.data.notifications) {
        const unread = res.data.notifications.filter(n => n.is_read === 0).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Lỗi khi lấy thông báo:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const unsubscribe = navigation.addListener("focus", fetchNotifications);
    return unsubscribe;
  }, [navigation]);

  const ads = [
    { id: 1, image: require("../../assets/ads/ads_1.jpg"), type: "link", link: "https://www.youtube.com/watch?v=2_04SN58vJY" },
    { id: 2, image: require("../../assets/ads/ads_2.jpg"), type: "qr" },
    { id: 3, image: require("../../assets/ads/ads_3.jpg"), type: "stripe" },
  ];

  const handleAdPress = async (ad) => {
    if (ad.type === "link") Linking.openURL(ad.link);
    else if (ad.type === "qr") {
      try {
        const res = await apiClient.get(`/qr/generate`);
        navigation.navigate("QrScreen", { qrDataURL: res.data.qrDataURL, qrCode: res.data.qrCode });
      } catch (err) { Alert.alert("Lỗi", "Không lấy được QR"); }
    } else if (ad.type === "stripe") {
      try {
        const res = await apiClient.post(`/payment/stripe/create-session`);
        if (res.data.url) Linking.openURL(res.data.url);
        else Alert.alert("Lỗi", "Không lấy được URL thanh toán.");
      } catch (err) { Alert.alert("Lỗi", "Không thể tạo phiên thanh toán."); }
    }
  };

  const handleOpenNotifications = async () => {
    navigation.navigate("Notifications");
    setUnreadCount(0);
    try { await apiClient.put(`/noti/markAllAsRead`); } catch (err) { console.error(err); }
  };

  // 🔹 Hàm click icon vị trí
  const handleOpenNearbyMap = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Bạn cần cấp quyền vị trí để tìm người dùng gần bạn.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const token = await AsyncStorage.getItem("token");
      const res = await apiClient.post(
        `/users/nearby`,
        { latitude, longitude },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const nearbyUsers = res.data.users || [];
      navigation.navigate("Nearby", { nearbyUsers, latitude, longitude });

    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Không thể lấy vị trí hoặc danh sách người dùng gần bạn.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>𝒯 𝓌 𝑜 𝓈 𝑒 𝓉</Text>
        <View style={styles.icons}>
          <TouchableOpacity onPress={handleOpenNotifications} style={{ position: "relative" }}>
            <Ionicons name="notifications-outline" size={30} color="black" />
            {unreadCount > 0 && (
              <View style={{
                position: "absolute", right: -4, top: -4, backgroundColor: "red",
                borderRadius: 10, minWidth: 18, height: 18,
                justifyContent: "center", alignItems: "center", paddingHorizontal: 3
              }}>
                <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="settings-outline" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Ads */}
      <ScrollView style={styles.adsContainer}>
        {ads.map(ad => (
          <TouchableOpacity key={ad.id} onPress={() => handleAdPress(ad)}>
            <Image source={ad.image} style={styles.adImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={handleOpenNearbyMap}>
          <FontAwesome name="map-marker" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Search")}>
          <Ionicons name="search" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("SwipeScreen")}>
          <Ionicons name="heart-outline" size={50} color="red" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Mess")}>
          <Ionicons name="chatbubble-outline" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
