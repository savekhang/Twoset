import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import AppNavigator from './src/navigation/AppNavigator';

const linking = {
  prefixes: ['twoset://'],
  config: {
    screens: {
      Success: 'success',
      // Các screen khác nếu muốn dùng deep link
    },
  },
};

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <AppNavigator />
    </NavigationContainer>
  );
}
