import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Platform
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import apiClient from "../app_api/apiClient";
import styles from "../styles/EditProfile.styles.js";

// ==========================================
// Reusable Modal Selector Component
// ==========================================
const OptionModal = ({ visible, onClose, data, onSelect }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id?.toString() || item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <Text style={styles.modalItemText}>
                {item.icon ? `${item.icon} ` : ""}
                {item.name || item}
              </Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={[styles.modalItem, { backgroundColor: "#ddd" }]}
          onPress={onClose}
        >
          <Text style={styles.modalItemText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default function EditProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [gender, setGender] = useState("other");
  const [birthdate, setBirthdate] = useState("");
  const [birthDateObj, setBirthDateObj] = useState(new Date());
  const [bio, setBio] = useState("");
  const [locationId, setLocationId] = useState(null);
  const [password, setPassword] = useState("");
  const [interests, setInterests] = useState([]);

  const [locations, setLocations] = useState([]);
  const [allInterests, setAllInterests] = useState([]);

  const [genderModal, setGenderModal] = useState(false);
  const [locationModal, setLocationModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ==========================================
  //  FETCH OPTIONS (location + interest)
  // ==========================================
  const fetchOptions = async () => {
    try {
      const locRes = await apiClient.get("/locations");
      setLocations(locRes.data.locations || locRes.data || []);

      const intRes = await apiClient.get("/interests");
      setAllInterests(intRes.data.interests || intRes.data || []);
    } catch (err) {
      console.log("Fetch options error:", err);
    }
  };

  // ==========================================
  //  FETCH USER PROFILE
  // ==========================================
  const fetchProfile = async () => {
    try {
      const res = await apiClient.get("/profile");
      const user = res.data.user;

      setName(user.name || "");
      setGender(user.gender || "other");
      setBio(user.bio || "");
      setLocationId(user.location_id || null);
      setInterests(user.interests || []);

      if (user.birthdate) {
        const d = new Date(user.birthdate);
        if (!isNaN(d.getTime())) {
          setBirthDateObj(d);
          setBirthdate(user.birthdate);
        }
      }

      setLoading(false);
    } catch (err) {
      console.log("Fetch profile error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchOptions();
      await fetchProfile();
    })();
  }, []);

  // ==========================================
  // EVENT: Toggle Interest
  // ==========================================
  const toggleInterest = (id) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ==========================================
  // EVENT: Date Picker
  // ==========================================
  const onChangeDate = (_, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const yyyy = selectedDate.getFullYear();
      const mm = ("0" + (selectedDate.getMonth() + 1)).slice(-2);
      const dd = ("0" + selectedDate.getDate()).slice(-2);
      setBirthdate(`${yyyy}-${mm}-${dd}`);
      setBirthDateObj(selectedDate);
    }
  };

  // ==========================================
  // SUBMIT UPDATE
  // ==========================================
  const handleSubmit = async () => {
    setSubmitting(true);

    const payload = {
      name,
      gender,
      birthdate,
      bio,
      location_id: locationId,
      interests,
      ...(password ? { password } : {}),
    };

    try {
      await apiClient.put("/users/update-profile", payload);
      Alert.alert("Success", "Profile updated successfully");
      navigation.goBack();
    } catch (err) {
      console.log("Update profile error:", err);
      Alert.alert("Error", "Failed to update profile");
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="red" />
      </View>
    );
  }

  // Helper: location name
  const currentLocation =
    locations.find((l) => l.id === locationId)?.name || "Select location";

  // Helper: gender label
  const genderLabel = gender.charAt(0).toUpperCase() + gender.slice(1);

  return (
    <ScrollView style={styles.container}>
      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      {/* Gender */}
      <Text style={styles.label}>Gender</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setGenderModal(true)}>
        <Text>{genderLabel}</Text>
      </TouchableOpacity>

      <OptionModal
        visible={genderModal}
        onClose={() => setGenderModal(false)}
        data={["male", "female", "other"]}
        onSelect={(g) => setGender(g)}
      />

      {/* Birthdate */}
      <Text style={styles.label}>Birthdate</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{birthdate || "Select birthdate"}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={birthDateObj}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}

      {/* Location */}
      <Text style={styles.label}>Location</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setLocationModal(true)}
      >
        <Text>{currentLocation}</Text>
      </TouchableOpacity>

      <OptionModal
        visible={locationModal}
        onClose={() => setLocationModal(false)}
        data={locations}
        onSelect={(loc) => setLocationId(loc.id)}
      />

      {/* Bio */}
      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={bio}
        multiline
        onChangeText={setBio}
      />

      {/* Password */}
      <Text style={styles.label}>Password (leave empty if not change)</Text>
      <TextInput
        style={styles.input}
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      {/* Interests */}
      <Text style={styles.label}>Interests</Text>
      <View style={styles.interestsContainer}>
        {allInterests.length > 0 ? (
          allInterests.map((i) => (
            <TouchableOpacity
              key={i.id}
              style={[
                styles.interestItem,
                interests.includes(i.id) && styles.interestSelected,
              ]}
              onPress={() => toggleInterest(i.id)}
            >
              <Text style={styles.interestText}>
                {i.icon} {i.name}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ color: "gray" }}>No interests available</Text>
        )}
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitText}>
          {submitting ? "Updating..." : "Update Profile"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
