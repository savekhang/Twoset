import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";
import axios from "axios";
import { API_BASE_URL } from "@env";
import styles from "../styles/DetailMessScreen.styles";

export default function GroupChatScreen({ route }) {
  const { chat_id, chat_name } = route.params; // thêm chat_name
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const userData = JSON.parse(await AsyncStorage.getItem("user"));
        if (!userData?.id) throw new Error("Không tìm thấy userId");
        setUserId(Number(userData.id));

        const token = await AsyncStorage.getItem("token");

        // Load old messages
        const res = await axios.get(`${API_BASE_URL}/group/messages/${chat_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!isMounted) return;

        setMessages(
          (res.data.messages || []).map((m) => ({
            ...m,
            sender_id: Number(m.sender_id),
            sender_name: m.sender_name || "Unknown",
            avatar_url: m.avatar_url || null,
            sent_at: new Date(m.sent_at),
          }))
        );

        // Socket
        const socketServer = API_BASE_URL.replace("/api", "");
        socketRef.current = io(socketServer, { transports: ["websocket"] });

        socketRef.current.on("connect", () => {
          socketRef.current.emit("joinGroup", { chat_id, user_id: Number(userData.id) });
          setSocketReady(true);
        });

        socketRef.current.on("disconnect", () => console.log("Socket disconnected"));

        socketRef.current.on("receiveGroupMessage", (msg) => {
          if (!isMounted) return;

          const normalizedMsg = {
            ...msg,
            sender_id: Number(msg.sender_id),
            sender_name: msg.sender_name,
            avatar_url: msg.avatar_url,
          };

          setMessages((prev) => {
            const tempIndex = prev.findIndex(
              (m) => m.tempId && m.content === normalizedMsg.content && m.sender_id === normalizedMsg.sender_id
            );
            if (tempIndex !== -1) {
              const newArr = [...prev];
              newArr[tempIndex] = normalizedMsg;
              return newArr;
            }
            return [...prev, normalizedMsg];
          });

          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        });
      } catch (err) {
        console.error("Init error:", err.response?.data || err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
    };
  }, []);

  const handleSend = () => {
    if (!message.trim() || !socketReady || !socketRef.current?.connected || !userId) return;

    const tempId = Date.now();
    const msgData = { chat_id, sender_id: userId, content: message.trim(), tempId };

    socketRef.current.emit("sendGroupMessage", msgData);

    setMessages((prev) => [
      ...prev,
      { ...msgData, id: `temp-${tempId}`, sender_name: "Bạn", avatar_url: null, sent_at: new Date() },
    ]);

    setMessage("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderItem = ({ item }) => {
    const isMine = Number(item.sender_id) === Number(userId);

    return (
      <View style={{ flexDirection: isMine ? "row-reverse" : "row", alignItems: "flex-end", marginBottom: 8 }}>
        {!isMine && item.avatar_url && <Image source={{ uri: item.avatar_url }} style={styles.avatar} />}

        <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
          {!isMine && item.sender_name && <Text style={{ fontWeight: "bold", marginBottom: 2 }}>{item.sender_name}</Text>}
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.timeText}>{item.sent_at ? new Date(item.sent_at).toLocaleTimeString() : ""}</Text>
        </View>
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
      {/* --- HEADER CUSTOM --- */}
      <View style={styles.header}>
        <Text style={styles.name}>{chat_name}</Text>
      </View>

      {/* --- MESSAGE LIST --- */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* --- INPUT FOOTER --- */}
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
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
