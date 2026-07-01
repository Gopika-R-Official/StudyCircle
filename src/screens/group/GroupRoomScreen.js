import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ref, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { rtdb } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';
import ChatTab from './ChatTab';
import NotesTab from './NotesTab';
import GoalsTab from './GoalsTab';
import MembersTab from './MembersTab';
import QuizzesTab from './QuizzesTab';

const TopTab = createMaterialTopTabNavigator();


export default function GroupRoomScreen({ route, navigation }) {
  const { groupId } = route.params;
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;
    const presenceRef = ref(rtdb, `presence/${groupId}/${user.uid}`);
    
    set(presenceRef, { online: true, lastSeen: serverTimestamp() });
    onDisconnect(presenceRef).set({ online: false, lastSeen: serverTimestamp() });

    return () => {
      set(presenceRef, { online: false, lastSeen: serverTimestamp() });
      onDisconnect(presenceRef).cancel();
    };
  }, [groupId, user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Group Room</Text>
      </View>
      
      <TopTab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontFamily: 'Inter_600SemiBold', textTransform: 'none', fontSize: 11 },
          tabBarIndicatorStyle: { backgroundColor: '#4F6EF7' },
          tabBarActiveTintColor: '#4F6EF7',
          tabBarInactiveTintColor: '#8A93A8',
          tabBarItemStyle: { paddingHorizontal: 0 },
        }}
      >
        <TopTab.Screen name="Chat" component={ChatTab} initialParams={{ groupId }} />
        <TopTab.Screen name="Notes" component={NotesTab} initialParams={{ groupId }} />
        <TopTab.Screen name="Goals" component={GoalsTab} initialParams={{ groupId }} />
        <TopTab.Screen name="Quiz" component={QuizzesTab} initialParams={{ groupId }} />
        <TopTab.Screen name="Members" component={MembersTab} initialParams={{ groupId }} />
      </TopTab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { padding: 16, backgroundColor: '#F7F9FC', flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 16 },
  backText: { color: '#4F6EF7', fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#1A1D23' },
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F9FC' },
  placeholderText: { fontFamily: 'Inter_400Regular', color: '#8A93A8' }
});
