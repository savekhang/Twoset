import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontFamily: "KaushanScript-Regular",
    fontSize: 32,
    color: "#ff3366",
  },
  icons: {
    flexDirection: "row",
    gap: 12,
  },
  adsContainer: {
    paddingTop: 80,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  adImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
    borderRadius: 12,
    marginBottom: 16,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 2,
    borderTopColor: "#f0f0f0",
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 10,
  },
  closeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default styles;
