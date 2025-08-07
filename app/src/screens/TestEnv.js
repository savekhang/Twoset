import React from 'react';
import { View, Text } from 'react-native';
import { API_BASE_URL } from '@env';

export default function TestEnv() {
  return (
    <View style={{ marginTop: 100, padding: 20 }}>
      <Text style={{ fontSize: 18 }}>API_BASE_URL: {API_BASE_URL}</Text>
    </View>
  );
}