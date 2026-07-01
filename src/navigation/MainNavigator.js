import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import GroupRoomScreen from '../screens/group/GroupRoomScreen';
import ExploreGroupsScreen from '../screens/main/ExploreGroupsScreen';
import QuizCreateScreen from '../screens/group/QuizCreateScreen';
import QuizTakeScreen from '../screens/group/QuizTakeScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="ExploreGroups" component={ExploreGroupsScreen} />
      <Stack.Screen name="GroupRoom" component={GroupRoomScreen} />
      <Stack.Screen name="QuizCreate" component={QuizCreateScreen} />
      <Stack.Screen name="QuizTake" component={QuizTakeScreen} />
    </Stack.Navigator>
  );
}
