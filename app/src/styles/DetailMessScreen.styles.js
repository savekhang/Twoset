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
    justifyContent: "space-between", // Căn đều các item
    backgroundColor: "#f6ceceff", // màu chủ đạo
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
  profileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Để link chiếm phần lớn không gian còn lại
    justifyContent: 'center', // Căn giữa avatar và tên
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: "#f52d2dff",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#cb3030ff",
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
  messageBubble: {
    maxWidth: "75%",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
  messageText: {
    fontSize: 15,
    color: "#000",
  },
  timeText: {
    fontSize: 11,
    color: "#777",
    alignSelf: "flex-end",
    marginTop: 3,
  },

  // --- INPUT AREA (FOOTER) ---
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6ceceff",
    borderTopWidth: 0,
    borderTopColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 14 : 8, // cao hơn một chút trên iOS
    marginBottom: Platform.OS === "ios" ? 8 : 4, // tạo khoảng hở với mép dưới
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: "#ff3366",
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ffb3c6", // viền nhạt theo tông chủ đạo
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 15,
    color: "#000",
    shadowColor: "#ff3366",
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  sendBtn: {
    backgroundColor: "#ff3366",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 13,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#ff3366",
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },

  // --- LOADING ---
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  // --- MODAL QUÀ TẶNG ---
  modalBlur: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  giftSheet: { backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 25, maxHeight: '80%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 22, fontWeight: 'bold' },
  giftGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  giftCard: { width: '31%', backgroundColor: '#fff5f7', borderRadius: 20, padding: 10, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#ffe0e9' },
  giftEmoji: { fontSize: 35, marginBottom: 5 },
  giftNameText: { fontSize: 11, fontWeight: 'bold', color: '#555' },
  giftPriceContainer: { flexDirection: 'row', alignItems: 'center' },
  giftPriceText: { fontSize: 12, color: '#ffae00', fontWeight: 'bold' },

  // --- AI SUGGESTIONS ---
  suggestionsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ff3366',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 5,
    width: '100%',
    justifyContent: 'space-between',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  suggestionsHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
