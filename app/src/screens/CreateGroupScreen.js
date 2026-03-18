import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import apiClient from "../app_api/apiClient";

export default function CreateGroupScreen({ route, navigation }) {
  const { user } = route.params; 
  const [allInterests, setAllInterests] = useState([]);
  const userInterests = route.params?.userInterests || []; 
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [selectedInterestId, setSelectedInterestId] = useState(null);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const res = await apiClient.get("/interests");
        setAllInterests(res.data);
        const filtered = res.data.filter((i) => user.interests.includes(i.name));
        setUserInterests(filtered);
      } catch (err) {
        console.log("Lỗi lấy sở thích:", err);
      }
    };
    fetchInterests();
  }, []);

  const createRoom = async () => {
    if (!name.trim())
      return Alert.alert("Lỗi", "Tên phòng không được để trống");
    if (!selectedInterestId)
      return Alert.alert("Lỗi", "Vui lòng chọn 1 sở thích cho phòng");

    try {
      await apiClient.post("/group/create", {
        name,
        password: password || null,
        interest_id: selectedInterestId,
      });

      Alert.alert("Thành công", "Phòng đã được tạo!", [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("GrList", {
              interest_id: selectedInterestId,
              interest_name: userInterests.find(
                (i) => i.id === selectedInterestId
              )?.name,
            });
          },
        },
      ]);
    } catch (err) {
      console.log("Lỗi tạo phòng:", err);
      Alert.alert("Lỗi", err.response?.data?.message || "Không thể tạo phòng");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tạo phòng chat mới</Text>

      <TextInput
        placeholder="Tên phòng..." 
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Mật khẩu phòng (tùy chọn)"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Text style={styles.subtitle}>Chọn sở thích cho phòng</Text>
      {userInterests.length === 0 ? (
        <Text style={{ color: "#888", marginBottom: 10 }}>
          Bạn chưa có sở thích nào
        </Text>
      ) : (
        <View style={styles.tagContainer}>
          {userInterests.map((interest) => {
            const selected = selectedInterestId === interest.id;
            return (
              <TouchableOpacity
                key={interest.id}
                onPress={() => setSelectedInterestId(interest.id)}
                style={[
                  styles.tag,
                  selected && styles.tagSelected,
                  { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
                ]}
              >
                <Text style={[styles.tagText, selected && styles.tagTextSelected]}>
                  {interest.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <TouchableOpacity style={styles.createBtn} onPress={createRoom}>
        <Text style={styles.createBtnText}>Tạo phòng</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 70, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#ff4d67" },
  input: {
    borderWidth: 1,
    borderColor: "#b3aeaeff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  subtitle: { fontSize: 18, fontWeight: "600", marginBottom: 10, color: "#333" },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    margin: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  tagSelected: {
    backgroundColor: "#ff4d67",
    borderColor: "#ff4d67",
  },
  tagText: { fontSize: 16, color: "#333" },
  tagTextSelected: { color: "#fff", fontWeight: "600" },
  createBtn: {
    backgroundColor: "#ff4d67",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
