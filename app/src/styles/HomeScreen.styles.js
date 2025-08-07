import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontFamily: 'KaushanScript-Regular',
    fontSize: 32,
    color: '#ff3366',
  },
  icons: {
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    fontSize: 26,
    marginLeft: 16,
  },
  adsContainer: {
    paddingTop: 80,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  adImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    borderRadius: 12,
    marginBottom: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#fff',
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 30,
  },
});

export default styles;
