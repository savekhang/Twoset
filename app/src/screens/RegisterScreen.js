import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import DropDownPicker from 'react-native-dropdown-picker';
import styles from '../styles/RegisterScreen.styles';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    gender: null,
    birthdate: '',
    bio: '',
    location_id: null,
    interests: [],
  });

  const [locations, setLocations] = useState([]);
  const [interestsList, setInterestsList] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [openLocation, setOpenLocation] = useState(false);
  const [openGender, setOpenGender] = useState(false);

  useEffect(() => {
    console.log('API_BASE_URL:', API_BASE_URL);
    const fetchData = async () => {
      try {
        const [locRes, intRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/locations`),
          axios.get(`${API_BASE_URL}/interests`),
        ]);
        setLocations(locRes.data);
        setInterestsList(intRes.data);
        setLocationOptions(
          locRes.data.map(loc => ({
            label: loc.name,
            value: loc.id,
          }))
        );
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu locations/interests:', error);
        Alert.alert('Lỗi', 'Không thể tải dữ liệu địa điểm hoặc sở thích.');
      }
    };
    fetchData();
  }, []);

  const toggleInterest = id => {
    setForm(prev => {
      const isSelected = prev.interests.includes(id);
      const newInterests = isSelected
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id];
      return { ...prev, interests: newInterests };
    });
  };

  const handleRegister = async () => {
    const { name, email, password, gender, birthdate, bio, location_id, interests } = form;

    if (!email || !password || !name || !gender || !birthdate || !location_id) {
      return Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin bắt buộc.');
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
      return Alert.alert('Lỗi', 'Ngày sinh phải có định dạng YYYY-MM-DD.');
    }

    if (interests.length < 2 || interests.length > 5) {
      return Alert.alert('Sở thích', 'Vui lòng chọn từ 2 đến 5 sở thích.');
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password,
        gender,
        birthdate,
        bio,
        location_id,
        interests,
      });

      Alert.alert('Thành công', res.data.message);
      navigation.navigate('Verify', { email });
    } catch (err) {
      console.error('❌ Lỗi đăng ký:', err.response?.data || err.message);
      Alert.alert('Lỗi', err.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={[styles.container, { paddingBottom: 100 }]}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={100}
    >
      <Text style={styles.logo}>𝒯 𝓌 𝑜 𝓈 𝑒 𝓉</Text>
      <Text style={styles.slogan}>Create your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#666"
        onChangeText={t => setForm(f => ({ ...f, name: t }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        onChangeText={t => setForm(f => ({ ...f, email: t }))}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        onChangeText={t => setForm(f => ({ ...f, password: t }))}
      />
      <Text style={styles.label}>Giới tính:</Text>
      <DropDownPicker
        open={openGender}
        setOpen={setOpenGender}
        value={form.gender}
        setValue={callback => setForm(f => ({ ...f, gender: callback(f.gender) }))}
        items={[
          { label: 'Nam', value: 'male' },
          { label: 'Nữ', value: 'female' },
          { label: 'Khác', value: 'other' },
        ]}
        placeholder="-- Chọn giới tính --"
        containerStyle={{ marginBottom: 20 }}
        zIndex={2000}
        dropDownDirection="DOWN"
        listMode="SCROLLVIEW"
      />
      <TextInput
        style={styles.input}
        placeholder="Birthdate (YYYY-MM-DD)"
        placeholderTextColor="#666"
        onChangeText={t => setForm(f => ({ ...f, birthdate: t }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Bio (optional)"
        placeholderTextColor="#666"
        onChangeText={t => setForm(f => ({ ...f, bio: t }))}
      />

      <Text style={styles.label}>Your Location:</Text>
      <DropDownPicker
        open={openLocation}
        setOpen={setOpenLocation}
        value={form.location_id}
        setValue={callback => setForm(f => ({ ...f, location_id: callback(f.location_id) }))}
        items={locationOptions}
        placeholder="-- Chọn địa điểm --"
        containerStyle={{ marginBottom: 20 }}
        zIndex={1000}
        dropDownDirection="DOWN"
        listMode="SCROLLVIEW"
      />

      <Text style={styles.label}>Your Interests (2-5):</Text>
      <View style={styles.selectContainer}>
        {interestsList.map(interest => (
          <TouchableOpacity
            key={interest.id}
            style={[styles.optionBtn, form.interests.includes(interest.id) && styles.optionSelected]}
            onPress={() => toggleInterest(interest.id)}
          >
            <Text>
              {interest.icon} {interest.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={handleRegister}>
        <Text style={styles.loginBtn}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.createAccount}>Already have an account? Login</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}