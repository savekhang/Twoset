import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // nền trắng
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50, // lùi xuống một chút cho thoáng
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent', // bỏ màu nền, thẳng lên container
    shadowColor: 'transparent', // bỏ shadow
    elevation: 0, // bỏ elevation Android
  },
  username: {
    fontFamily: 'KaushanScript-Regular',
    fontSize: 26,
    color: '#ff3366', // màu hồng nổi bật
  },
  editButtonHeader: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: 'transparent', // icon trôi trên nền
  },
  editButtonTextHeader: {
    color: '#ff3366', // icon/text màu hồng
    fontSize: 14,
    fontWeight: '600',
  },

  profileInfo: {
    backgroundColor: '#ffe9e9ff', // card trắng
    margin: 20,
    marginTop: 30,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#ff3366',
    marginBottom: 12,
  },
  premiumTag: {
    marginBottom: 12,
    color: '#ff3366',
    fontSize: 16,
    fontWeight: '600',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  bio: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    textAlign: 'center',
  },
  gender: {
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  age: {
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: '#000',
    marginBottom: 10,
  },

  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
    justifyContent: 'center',
  },
  interestItem: {
    backgroundColor: '#fbd4e3ff',
    color: '#ff3366',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    margin: 4,
    fontSize: 13,
    overflow: 'hidden',
  },
  interest: {
    fontSize: 14,
    color: '#999',
    marginVertical: 8,
  },

  editButton: {
    backgroundColor: '#ff3366',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 15,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  albumIconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  albumText: {
    fontSize: 18,
    marginLeft: 10,
    color: '#ff3366',
    fontWeight: '600',
  },

  postsGrid: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
  },
  postImage: {
    // width: 110,
    height: 110,
    marginVertical: 3,
    borderRadius: 15,
  },

  editProfileButton: {
    backgroundColor: '#ff3366',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 15,
  },
  editProfileText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default styles;
