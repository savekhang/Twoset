import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UploadAvatarScreen from '../screens/UploadAvatarScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QrScreen from '../screens/QrScreen';
import PaymentScreen from '../screens/PaymentScreen';
import SuccessScreen from '../screens/SuccessScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyScreen from '../screens/VerifyScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import SwipeScreen from '../screens/SwipeScreen';
import SwipeRandomScreen from '../screens/SwipeRandomScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SearchScreen from '../screens/SearchScreen';
import MessageScreen from '../screens/MessageScreen';
import DetailMessScreen from '../screens/DetailMessScreen';
import NearbyMapScreen from '../screens/NearbyMapScreen';
import SwipePremiumScreen from '../screens/SwipePremiumScreen';
import GroupChatListScreen from '../screens/GroupChatListScreen';
import GroupChatScreen from '../screens/GroupChatScreen';
import JoinGroupScreen from '../screens/JoinGroupScreen';
import GroupInterestScreen from '../screens/GroupInterestScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import SettingScreen from '../screens/SettingScreen';
import InteractionHistoryScreen from '../screens/InteractionHistoryScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="UploadAvatar" component={UploadAvatarScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="QrScreen" component={QrScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Forgot" component={ForgotPasswordScreen} />
      <Stack.Screen name="Verify" component={VerifyScreen} />
      <Stack.Screen name="Success" component={SuccessScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="SwipeScreen" component={SwipeScreen} />
      <Stack.Screen name="Settings" component={SettingScreen} />
      <Stack.Screen name="InteractionHistory" component={InteractionHistoryScreen} />
       <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen
      name="SwipeRandom"
      component={SwipeRandomScreen}
      options={{ title: "Swipe ngẫu nhiên" }}
      />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Mess" component={MessageScreen} />
      <Stack.Screen name="DetailMess" component={DetailMessScreen} />
      <Stack.Screen name="Nearby" component={NearbyMapScreen} />
      <Stack.Screen name="SwipePremium" component={SwipePremiumScreen} />
      <Stack.Screen name="GrChat" component={GroupChatScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen 
        name="GrChatIn" 
        component={GroupInterestScreen} 
        options={{ headerShown: true }}
      />

      <Stack.Screen 
        name="GrList" 
        component={GroupChatListScreen} 
        options={{ headerShown: true }}
      />

      <Stack.Screen 
        name="GrJoin" 
        component={JoinGroupScreen}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
