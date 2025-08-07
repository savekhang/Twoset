import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 80,
  },
  logo: {
    fontFamily: 'KaushanScript-Regular',
    fontSize: 36,
    textAlign: 'center',
    color: '#ff3366',
    marginBottom: 10,
  },
  slogan: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginBottom: 30,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
    color: '#555',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10,
  },
  optionBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
  },
  optionSelected: {
    backgroundColor: '#ff3366',
    borderColor: '#ff3366',
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
    fontSize: 16,
    paddingTop: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    height: 50, // 👈 thêm dòng này
    justifyContent: 'center',
  },
  
});
