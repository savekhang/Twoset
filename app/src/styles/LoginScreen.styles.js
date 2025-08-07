import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 100,
    backgroundColor: '#fff',
  },
  logo: {
    fontFamily: 'KaushanScript-Regular',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#ff3366',
  },
  slogan: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginBottom: 100,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  loginBtn: {
    backgroundColor: '#ff3366',
    color: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 15,
  },
  createAccount: {
    color: '#ff3366',
    textAlign: 'center',
    paddingTop: 40,
    fontSize: 20,
    marginBottom: 40,
  },
  forgot: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default styles;
