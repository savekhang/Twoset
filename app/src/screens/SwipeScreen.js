import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function SwipeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Tiêu đề */}
      <Text style={styles.title}>Chọn kiểu Swipe</Text>

      {/* Nút Swipe ngẫu nhiên */}
      <TouchableOpacity
        style={[styles.button, styles.randomButton]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("SwipeRandom")}
      >
        <Text style={styles.buttonText}> Swipe ngẫu nhiên</Text>
      </TouchableOpacity>

      {/* Nút Swipe Premium */}
      <TouchableOpacity
        style={[styles.button, styles.premiumButton]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("SwipePremium")}
      >
        <Text style={styles.premiumText}> Swipe tương thích cao (Premium)</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Khám phá và kết nối theo cách của bạn 🎧
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa", // nền sáng nhẹ
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ff3366",
    marginBottom: 50,
    letterSpacing: 0.3,
  },
  button: {
    width: "85%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 2,
  },
  randomButton: {
    backgroundColor: "#ff3366",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  premiumButton: {
    backgroundColor: "#ff0533ff",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  premiumText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000ff",
  },
  footerText: {
    position: "absolute",
    bottom: 40,
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
});
