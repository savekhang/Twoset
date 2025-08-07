import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center', // đưa logo ra giữa
    marginBottom: 20,
  },
  logo: {
    fontFamily: 'KaushanScript-Regular',
    fontSize: 36,
    color: '#ff3366',
  },
  qrWrapper: {
    flex: 1,
    paddingTop: 80,
    justifyContent: 'flex-start', // đẩy lên trên 1 chút
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    color: '#ff3366',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  qrImage: {
    width: 260,
    height: 260,
    borderRadius: 12,
    borderWidth: 6,
    borderColor: '#ff3366',
  },
  noteText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default styles;
