import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdfdfd",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  card: {
    width: width * 0.9,
    backgroundColor: "#ffe9e9ff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    alignItems: "center",
    paddingBottom: 25,
  },
  avatar: {
    width: "100%",
    height: width * 1.1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    resizeMode: "cover",
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },
  location: {
    fontSize: 16,
    color: "#777",
    marginBottom: 6,
  },
  bio: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 15,
    width: "80%",
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  dislike: {
    backgroundColor: "#ff4d4d",
  },
  info: {
    backgroundColor: "#414141ff",
  },
  like: {
    backgroundColor: "#ff3366",
  },
});
