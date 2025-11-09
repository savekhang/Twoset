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
import MapView, { Marker, Callout, CalloutSubview } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "@env";

export default function NearbyMapScreen({ route, navigation }) {
  const { nearbyUsers = [], latitude, longitude } = route.params || {};
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mapRef.current && nearbyUsers.length > 0) {
      const markers = nearbyUsers.map((u) => ({
        latitude: parseFloat(u.latitude),
        longitude: parseFloat(u.longitude),
      }));
      markers.push({ latitude, longitude });

      mapRef.current.fitToCoordinates(markers, {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });
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
      console.error("Fetch user profile error:", err.response?.data || err.message);
      Alert.alert("Lỗi", "Không thể tải hồ sơ người dùng");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f4454b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        ref={mapRef}
        initialRegion={{
          latitude: latitude || 21.0278,
          longitude: longitude || 105.8342,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
      >
        {/* Marker bản thân */}
        <Marker coordinate={{ latitude, longitude }} title="Bạn đang ở đây" pinColor="blue" />

        {/* Marker người dùng khác */}
        {nearbyUsers.map((user) => (
          <Marker
            key={user.id}
            coordinate={{
              latitude: parseFloat(user.latitude),
              longitude: parseFloat(user.longitude),
            }}
            anchor={{ x: 0.5, y: 1 }}
          >
            {user.avatar_url && (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            )}

            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutName}>{user.name}</Text>
                <Text style={styles.calloutDistance}>
                  Cách bạn {(user.distance || 0).toFixed(2)} km
                </Text>

                <CalloutSubview onPress={() => handleViewProfile(user.id)}>
                  <View style={styles.calloutButton}>
                    <Ionicons name="person-circle-outline" size={22} color="#fff" />
                    <Text style={styles.calloutButtonText}>Xem hồ sơ</Text>
                  </View>
                </CalloutSubview>

                <View style={styles.arrowDown} />
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  calloutContainer: {
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    minHeight: 80,
  },
  calloutName: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 2,
  },
  calloutDistance: {
    color: "#ddd",
    fontSize: 12,
    marginBottom: 2,
  },
  calloutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4454bff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 45,
    marginLeft: 23,
    width: "80%",
    alignSelf: "center",
  },
  calloutButtonText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
  },
  arrowDown: {
    position: "absolute",
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "rgba(0,0,0,0.8)",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 30,
    padding: 8,
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
