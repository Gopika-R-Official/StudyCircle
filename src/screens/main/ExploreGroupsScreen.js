import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import DiscoverGroupsTab from './DiscoverGroupsTab';
import CreateGroupTab from './CreateGroupTab';

const TopTab = createMaterialTopTabNavigator();

export default function ExploreGroupsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Explore Groups</Text>
      </View>
      <TopTab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontFamily: 'Inter_600SemiBold', textTransform: 'none' },
          tabBarIndicatorStyle: { backgroundColor: '#4F6EF7' },
          tabBarActiveTintColor: '#4F6EF7',
          tabBarInactiveTintColor: '#8A93A8',
        }}
      >
        <TopTab.Screen name="Discover" component={DiscoverGroupsTab} />
        <TopTab.Screen name="Create" component={CreateGroupTab} />
      </TopTab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { padding: 16, backgroundColor: '#F7F9FC', flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 16 },
  backText: { color: '#4F6EF7', fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#1A1D23' }
});
