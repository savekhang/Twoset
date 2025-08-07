import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 100,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#ff3366',
  },
  imageBox: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 30,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    color: '#999',
    textAlign: 'center',
  },
  uploadBtn: {
    backgroundColor: '#ff3366',
    paddingVertical: 15,
    borderRadius: 10,
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
