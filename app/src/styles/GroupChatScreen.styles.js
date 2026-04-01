import { StyleSheet, StatusBar, Platform } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6ceceff",
  },

  // --- HEADER ---
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f6ceceff",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 3,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 6 : 44,
  },
  backButton: {
    padding: 6,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#cb3030ff",
    textAlign: 'center',
    flex: 1,
  },
  giftButton: {
    padding: 6,
  },

  // --- MESSAGE LIST ---
  messageList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  theirMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginVertical: 2, // reduce vertical margin
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#ff3366",
    borderBottomRightRadius: 6,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f2f2f2",
    borderBottomLeftRadius: 6,
  },
  senderName: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 3,
    color: '#ff3366'
  },
  messageText: {
    fontSize: 15,
    color: "#000",
  },
  timeText: {
    fontSize: 10,
    color: "#777",
    alignSelf: "flex-end",
    marginTop: 3,
  },

  // --- INPUT AREA ---
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6ceceff",
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 14 : 8,
    marginBottom: Platform.OS === "ios" ? 8 : 4,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 15,
    color: "#000",
  },
  sendBtn: {
    backgroundColor: "#ff3366",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 13,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  // --- LOADING ---
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  // --- MODALS ---
  modalBlur: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 25, maxHeight: '80%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 22, fontWeight: 'bold' },
  
  // Member Selection
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
  },

  // Gift Selection
  giftGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  giftCard: { width: '31%', backgroundColor: '#fff5f7', borderRadius: 20, padding: 10, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#ffe0e9' },
  giftEmoji: { fontSize: 35, marginBottom: 5 },
  giftNameText: { fontSize: 11, fontWeight: 'bold', color: '#555' },
  giftPriceContainer: { flexDirection: 'row', alignItems: 'center' },
  giftPriceText: { fontSize: 12, color: '#ffae00', fontWeight: 'bold' },
});
