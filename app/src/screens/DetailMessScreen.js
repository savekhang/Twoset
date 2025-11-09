import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";
import axios from "axios";
import { API_BASE_URL } from "@env";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/DetailMessScreen.styles";

export default function DetailMessScreen({ route }) {
  const { matchUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  // --- Format thời gian
  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    return `${h}:${m} • ${day}/${month}`;
  };

  // --- Lấy receiver_id đúng
  const getReceiverId = () => {
    if (!matchUser || !userId) return null;
    if (matchUser.partner_id && matchUser.partner_id !== userId) return matchUser.partner_id;
    if (matchUser.user1_id && matchUser.user2_id) return matchUser.user1_id === userId ? matchUser.user2_id : matchUser.user1_id;
    return null;
  };

  // --- Init socket + fetch messages
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userData = JSON.parse(await AsyncStorage.getItem("user"));
        if (!userData?.id) throw new Error("Không tìm thấy userId");
        setUserId(userData.id);

        // --- Socket ---
        const socketServer = API_BASE_URL.replace("/api", "");
        socketRef.current = io(socketServer, { transports: ["websocket"] });

        socketRef.current.on("connect", () => {
          console.log("🟢 Socket connected:", socketRef.current.id);
          socketRef.current.emit("registerUser", userData.id);
        });

        socketRef.current.on("disconnect", () => {
          console.log("🔴 Socket disconnected");
        });

        // --- Nhận tin nhắn realtime ---
        socketRef.current.on("receiveMessage", (data) => {
          if (!data || !isMounted) return;
          if (data.match_id === matchUser.match_id) {
            setMessages((prev) => {
              const filtered = prev.filter(
                (m) => !(m.tempId && m.sender_id === data.sender_id && m.content.trim() === data.content.trim())
              );
              if (filtered.some((m) => m.id === data.id)) return filtered;
              return [...filtered, data];
            });
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          }
        });

        // --- Fetch old messages ---
        await fetchMessages(token);
      } catch (err) {
        console.error("Init error:", err.message);
        Alert.alert("Lỗi", "Không thể tải dữ liệu chat.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
      console.log("🧹 Socket disconnected");
    };
  }, []);

  // --- Fetch messages từ server
  const fetchMessages = async (token) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/mess/${matchUser.match_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.messages || []);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error("Fetch messages error:", err.response?.data || err.message);
    }
  };

  // --- Gửi tin nhắn
  const handleSend = () => {
    if (!message.trim()) return;
    if (!socketRef.current?.connected) {
      Alert.alert("Mất kết nối", "Không thể gửi tin nhắn ngay bây giờ.");
      return;
    }

    const receiver_id = getReceiverId();
    if (!receiver_id) {
      console.warn("⚠️ Không xác định được receiver_id:", matchUser);
      Alert.alert("Lỗi", "Không thể gửi tin nhắn. Receiver_id không hợp lệ.");
      return;
    }

    const msgData = {
      match_id: matchUser.match_id,
      sender_id: userId,
      receiver_id,
      content: message.trim(),
      tempId: Date.now(),
    };

    socketRef.current.emit("sendMessage", msgData);

    // Hiển thị tạm tin nhắn cho sender
    setMessages((prev) => [
      ...prev,
      { ...msgData, id: `temp-${msgData.tempId}`, sent_at: new Date() },
    ]);

    setMessage("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const renderItem = ({ item }) => {
    const isMine = item.sender_id?.toString() === userId?.toString();
    return (
      <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.timeText}>{formatDateTime(item.sent_at || item.created_at || new Date())}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff3366" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image source={{ uri: matchUser.partner_avatar }} style={styles.avatar} />
        <Text style={styles.name}>{matchUser.partner_name}</Text>
      </View>

      {/* CHAT BODY */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* FOOTER */}
      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#999"
          style={styles.input}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
