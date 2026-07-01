import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/main/HomeScreen';
import LeaderboardScreen from '../screens/main/LeaderboardScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4F6EF7',
        tabBarInactiveTintColor: '#8A93A8',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopColor: '#E2E8F0',
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 12
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Groups') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Leaderboard') iconName = focused ? 'trophy' : 'trophy-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Groups" component={HomeScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
