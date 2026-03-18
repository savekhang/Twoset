import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../app_api/apiClient";

export default function GroupChatListScreen({ route, navigation }) {
  const { interest_id, interest_name } = route.params;
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    navigation.setOptions({ title: `Phòng: ${interest_name}` });
    const fetchUser = async () => {
      try {
        const json = await AsyncStorage.getItem("user");
        if (json) setUser(JSON.parse(json));
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadRooms);
    return unsubscribe;
  }, []);

  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await apiClient.get(`/group/interest/${interest_id}`);
      setRooms(res.data.rooms ?? []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingRooms(false);
    }
  };

  if (!user || loadingRooms) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ff4d67" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      {/* Nút tạo phòng chỉ cho user Premium */}
      {/* {user?.isPremium && (
        <TouchableOpacity
          style={{
            backgroundColor: "#ff4d67",
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 12,
            marginBottom: 16,
            alignSelf: "flex-end",
          }}
          onPress={() => navigation.navigate("CreateGroup", { interest_id })}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>+ Tạo phòng</Text>
        </TouchableOpacity>
      )} */}

      {rooms.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 40, color: "#888", fontSize: 16 }}>
          Chưa có phòng chat nào
        </Text>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                backgroundColor: "#fdf0f2",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={() => navigation.navigate("GrJoin", { chat_id: item.id, chat_name: item.name })}
            >
              <Text style={{ fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 4 }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 14, color: "#888" }}>Tạo bởi: {item.creator_name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
