import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)", // nền mờ nhẹ hơn
    paddingHorizontal: 20,
  },

  card: {
    width: width * 0.85,
    maxHeight: height * 0.85,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },

  avatar: {
    width: "100%",
    height: 360,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  infoContainer: {
    padding: 15,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
  },
  location: {
    fontSize: 16,
    color: "#777",
  },
  bio: {
    fontSize: 14,
    color: "#555",
    marginTop: 6,
  },

  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 18,
    backgroundColor: "#fafafa",
  },

  iconCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },

  infoButton: {
    backgroundColor: "#e6f6ff",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#ff5a5f",
    borderRadius: 10,
  },

  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
