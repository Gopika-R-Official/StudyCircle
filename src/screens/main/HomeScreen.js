import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'groupMembers'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(fetchedGroups);
    });
    return unsubscribe;
  }, [user]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Groups</Text>
      </View>
      
      {groups.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You haven't joined any groups yet.</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('GroupRoom', { groupId: item.groupId })}>
              <Text style={styles.groupName}>{item.groupName || 'Study Group'}</Text>
              <Text style={styles.groupSubject}>{item.subject || 'General'}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ExploreGroups')}>
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 28, color: '#1A1D23' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontFamily: 'Inter_400Regular', color: '#8A93A8' },
  list: { padding: 24, paddingTop: 0 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  groupName: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: '#1A1D23', marginBottom: 4 },
  groupSubject: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#4F6EF7' },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#4F6EF7', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: '#4F6EF7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }
});
