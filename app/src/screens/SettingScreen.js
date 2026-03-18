import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LogoutScreen({ navigation }) {

  // 🔹 Xử lý logout
  const handleLogout = async () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("token");
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }
        }
      ]
    );
  };

  return (
    <View style={{
      flex: 1,
      backgroundColor: "#fff",
      paddingVertical: 40,
      paddingHorizontal: 25,
    }}>
      
      <Text style={{
        fontSize: 28,
        fontWeight: "600",
        marginBottom: 30,
        textAlign: "center"
      }}>
        Tùy chọn tài khoản
      </Text>

      {/* Lịch sử tương tác */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 18,
          borderBottomWidth: 1,
          borderColor: "#ddd",
        }}
        onPress={() => navigation.navigate("InteractionHistory")}
      >
        <FontAwesome5 name="history" size={24} color="black" />
        <Text style={{ marginLeft: 15, fontSize: 18 }}>Lịch sử tương tác</Text>
      </TouchableOpacity>

      {/* Thay đổi thông tin */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 18,
          borderBottomWidth: 1,
          borderColor: "#ddd",
        }}
        onPress={() => navigation.navigate("EditProfile")}
      >
        <Ionicons name="create-outline" size={26} color="black" />
        <Text style={{ marginLeft: 15, fontSize: 18 }}>Thay đổi thông tin</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 18,
          marginTop: 40,
        }}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={28} color="red" />
        <Text style={{ marginLeft: 15, fontSize: 18, color: "red" }}>
          Đăng xuất
        </Text>
      </TouchableOpacity>
    </View>
  );
}
