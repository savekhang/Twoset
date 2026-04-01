import React, { useRef, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { Marker, Callout, CalloutSubview, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "@env";

export default function NearbyMapScreen({ route, navigation }) {
  // 1. Kiểm tra log ngay khi vào màn hình
  console.log("📍 NearbyMapScreen Loaded");
  console.log("📍 Params received:", JSON.stringify(route.params));

  const { nearbyUsers = [], latitude, longitude } = route.params || {};
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Đảm bảo tọa độ là số
  const myLat = Number(latitude);
  const myLon = Number(longitude);

  useEffect(() => {
    if (mapRef.current && nearbyUsers.length > 0) {
      const markers = nearbyUsers.map((u) => ({
        latitude: parseFloat(u.latitude),
        longitude: parseFloat(u.longitude),
      }));
      markers.push({ latitude: myLat, longitude: myLon });

      // Delay nhẹ để MapView kịp render layout
      setTimeout(() => {
        mapRef.current.fitToCoordinates(markers, {
          edgePadding: { top: 70, right: 70, bottom: 70, left: 70 },
          animated: true,
        });
      }, 800);
    }
  }, [nearbyUsers]);

  const handleViewProfile = async (userId) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/users/userProfile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigation.navigate("UserProfile", { user: res.data.profile });
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải hồ sơ người dùng");
    } finally {
      setLoading(false);
    }
  };

  // Nếu thiếu tọa độ thì không render map để tránh lỗi trắng màn hình
  if (!latitude || !longitude) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy tọa độ vị trí của bạn.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
           <Text style={{color: 'blue', marginTop: 10}}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        // provider={PROVIDER_GOOGLE} // Bỏ comment nếu bạn đã cài Google Maps cho Android
        style={styles.map}
        ref={mapRef}
        initialRegion={{
          latitude: myLat,
          longitude: myLon,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
      >
        {/* Marker vị trí của tôi */}
        <Marker 
            coordinate={{ latitude: myLat, longitude: myLon }} 
            title="Bạn đang ở đây" 
            pinColor="blue" 
        />

        {/* Marker những người xung quanh */}
        {nearbyUsers.map((user) => (
          <Marker
            key={user.id.toString()}
            coordinate={{
              latitude: parseFloat(user.latitude),
              longitude: parseFloat(user.longitude),
            }}
          >
            <View style={styles.markerWrapper}>
                {user.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                ) : (
                <Ionicons name="person-circle" size={40} color="#ccc" />
                )}
            </View>

            <Callout tooltip onPress={() => handleViewProfile(user.id)}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutName}>{user.name}</Text>
                <Text style={styles.calloutDistance}>
                  Cách bạn {(Number(user.distance) || 0).toFixed(2)} km
                </Text>
                <View style={styles.calloutButton}>
                  <Text style={styles.calloutButtonText}>Xem hồ sơ</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      {loading && (
        <View style={styles.overlayLoading}>
          <ActivityIndicator size="large" color="#ff3366" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  map: { 
    width: '100%', 
    height: '100%' 
  },
  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 3,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#ff3366',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  avatar: { 
    width: 45, 
    height: 45, 
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: '#fff'
  },
  calloutContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    width: 160,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  calloutName: { 
    fontWeight: "700", 
    fontSize: 16, 
    color: '#333',
    marginBottom: 4
  },
  calloutDistance: { 
    color: "#666", 
    fontSize: 13, 
    marginVertical: 4,
    fontWeight: '500'
  },
  calloutButton: {
    backgroundColor: "#ff3366",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 6,
    shadowColor: '#ff3366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  calloutButtonText: { 
    color: "#fff", 
    fontSize: 12, 
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  backButton: {
    position: "absolute", 
    top: 50, 
    left: 20,
    backgroundColor: "rgba(255,255,255,0.9)", 
    borderRadius: 25,
    width: 50, 
    height: 50, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: '#f8f9fa'
  },
  overlayLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  }
});