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
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";
import axios from "axios";
import { API_BASE_URL } from "@env";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import styles from "../styles/GroupChatScreen.styles";

export default function GroupChatScreen({ route, navigation }) {
  const { chat_id, chat_name } = route.params;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);
  const [socketReady, setSocketReady] = useState(false);

  // States for Gifting Flow
  const [showMemberSelectionModal, setShowMemberSelectionModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedUserForGift, setSelectedUserForGift] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [loadingGifts, setLoadingGifts] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

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

  // ==============================
  // 🎁 LOGIC QUÀ TẶNG (NHÓM)
  // ==============================

  // 1. Mở modal chọn người nhận
  const handleOpenMemberSelection = async () => {
    try {
      setLoadingMembers(true);
      setShowMemberSelectionModal(true);
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/group/members/${chat_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Lọc ra chính mình
      const otherMembers = res.data.members.filter(m => m.user_id !== userId);
      setGroupMembers(otherMembers);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách thành viên.");
      setShowMemberSelectionModal(false);
    } finally {
      setLoadingMembers(false);
    }
  };

  // 2. Sau khi chọn người, mở modal quà
  const handleSelectUserForGift = (user) => {
    setSelectedUserForGift(user);
    setShowMemberSelectionModal(false);
    fetchGifts(); // Mở modal quà
  };

  // 3. Tải danh sách quà
  const fetchGifts = async () => {
    try {
      setLoadingGifts(true);
      setShowGiftModal(true);
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/gifts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGifts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách quà tặng.");
      setShowGiftModal(false);
    } finally {
      setLoadingGifts(false);
    }
  };

  // 4. Gửi quà
  const handleSendGift = (gift) => {
    if (!selectedUserForGift) {
      Alert.alert("Lỗi", "Chưa chọn người nhận quà.");
      return;
    }

    Alert.alert(
      "Xác nhận tặng quà",
      `Tặng ${gift.icon} ${gift.name} (${gift.price} xu) cho ${selectedUserForGift.name}?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Tặng", 
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const res = await axios.post(`${API_BASE_URL}/send-gift`, {
                receiver_id: selectedUserForGift.user_id,
                gift_id: gift.id
              }, { headers: { Authorization: `Bearer ${token}` } });

              Alert.alert("Thành công! 🎁", res.data.message);
              setShowGiftModal(false);
              setSelectedUserForGift(null);
            } catch (err) {
              Alert.alert("Thông báo", err.response?.data?.message || "Lỗi giao dịch.");
            }
          }
        }
      ]
    );
  };

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
      <View style={[styles.messageContainer, isMine ? styles.myMessageContainer : styles.theirMessageContainer]}>
        {!isMine && (
            <Image 
                source={{ uri: item.avatar_url || 'https://via.placeholder.com/150' }} 
                style={styles.avatar} 
            />
        )}
        <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
          {!isMine && <Text style={styles.senderName}>{item.sender_name}</Text>}
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.timeText}>{item.sent_at ? new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</Text>
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff3366" />
        </TouchableOpacity>
        <Text style={styles.groupName}>{chat_name}</Text>
        <TouchableOpacity onPress={handleOpenMemberSelection} style={styles.giftButton}>
            <MaterialIcons name="card-giftcard" size={28} color="#ff3366" />
        </TouchableOpacity>
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
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* --- MODAL CHỌN THÀNH VIÊN --- */}
      <Modal visible={showMemberSelectionModal} animationType="slide" transparent>
        <View style={styles.modalBlur}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Tặng quà cho</Text>
              <TouchableOpacity onPress={() => setShowMemberSelectionModal(false)}>
                <Ionicons name="close-circle" size={32} color="#ccc" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={groupMembers}
              keyExtractor={(item) => item.user_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.memberItem} onPress={() => handleSelectUserForGift(item)}>
                  <Image source={{ uri: item.avatar_url || 'https://via.placeholder.com/150' }} style={styles.memberAvatar} />
                  <Text style={styles.memberName}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text>Không có thành viên nào khác trong nhóm.</Text>}
              onRefresh={handleOpenMemberSelection}
              refreshing={loadingMembers}
            />
          </View>
        </View>
      </Modal>

      {/* --- MODAL CHỌN QUÀ --- */}
      <Modal visible={showGiftModal} animationType="slide" transparent>
        <View style={styles.modalBlur}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Gửi quà tặng cho {selectedUserForGift?.name}</Text>
              <TouchableOpacity onPress={() => setShowGiftModal(false)}>
                <Ionicons name="close-circle" size={32} color="#ccc" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.giftGrid}>
              {loadingGifts ? (
                <ActivityIndicator size="large" color="#ff3366" />
              ) : (
                gifts.map((gift) => (
                  <TouchableOpacity key={gift.id} style={styles.giftCard} onPress={() => handleSendGift(gift)}>
                    <Text style={styles.giftEmoji}>{gift.icon}</Text>
                    <Text style={styles.giftNameText}>{gift.name}</Text>
                    <View style={styles.giftPriceContainer}>
                      <MaterialIcons name="monetization-on" size={14} color="#ffae00" />
                      <Text style={styles.giftPriceText}>{gift.price}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}
