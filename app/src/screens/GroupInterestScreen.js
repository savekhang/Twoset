import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "@env";

export default function GroupInterestScreen({ navigation }) {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchInterests();
    fetchUser();
  }, []);

  const fetchInterests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/interests`);
      setInterests(res.data);
    } catch (error) {
      console.log(error);
      Alert.alert("Lỗi", "Không thể lấy danh sách chủ đề");
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const json = await AsyncStorage.getItem("user");
      if (json) setUser(JSON.parse(json));
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateRoom = () => {
    if (!user) return Alert.alert("Lỗi", "Không tìm thấy thông tin user");
    if (!user.isPremium) return Alert.alert("Chỉ user Premium mới có thể tạo phòng");

    const userInterestsWithId = interests.filter((i) =>
      user.interests.includes(i.name)
    );

    if (!userInterestsWithId.length)
      return Alert.alert("Lỗi", "Bạn chưa có sở thích hợp lệ để tạo phòng");

    navigation.navigate("CreateGroup", {
      userInterests: userInterestsWithId,
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ff4d67" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      {/* Header */}
      {/* Nút tạo phòng */}
      {user?.isPremium && (
        <TouchableOpacity
          style={{
            backgroundColor: "#ff4d67",
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderRadius: 12,
            marginBottom: 16,
            alignSelf: "flex-end",
            
          }}
          onPress={handleCreateRoom}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>+ Tạo phòng</Text>
        </TouchableOpacity>
      )}
      <Text style={{ fontSize: 26, fontWeight: "bold", color: "#ff4d67", marginBottom: 20 }}>
        Chọn chủ đề phòng chat
      </Text>

      {/* Danh sách interests */}
      <FlatList
        data={interests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fdf0f2",
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={() =>
              navigation.navigate("GrList", {
                interest_id: item.id,
                interest_name: item.name,
              })
            }
          >
            <Text style={{ fontSize: 24, marginRight: 12 }}>{item.icon}</Text>
            <Text style={{ fontSize: 18, fontWeight: "500", color: "#333" }}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
