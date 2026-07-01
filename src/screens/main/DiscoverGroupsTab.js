import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

export default function DiscoverGroupsTab({ navigation }) {
  const { user, userData } = useContext(AuthContext);
  const [publicGroups, setPublicGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredGroups = publicGroups.filter(g => 
    (g.name && g.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (g.subject && g.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    fetchPublicGroups();
  }, []);

  const fetchPublicGroups = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'groups'), where('isPublic', '==', true));
      const snapshot = await getDocs(q);
      const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPublicGroups(groups);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (group) => {
    try {
      await setDoc(doc(db, 'groupMembers', `${group.id}_${user.uid}`), {
        groupId: group.id,
        userId: user.uid,
        userName: userData?.name || 'User',
        groupName: group.name,
        subject: group.subject,
        role: 'Member',
        joinedAt: new Date().toISOString(),
        streak: 0,
        weeklyScore: 0
      });
      Alert.alert('Success', `You joined ${group.name}!`);
      navigation.navigate('GroupRoom', { groupId: group.id });
    } catch (e) {
      Alert.alert('Error', 'Could not join group.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8A93A8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or subject..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredGroups}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchPublicGroups}
        ListEmptyComponent={<Text style={styles.emptyText}>No public groups found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subject}>{item.subject}</Text>
              {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
            </View>
            <TouchableOpacity style={styles.joinBtn} onPress={() => joinGroup(item)}>
              <Text style={styles.joinBtnText}>Join</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  list: { padding: 16 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  info: { flex: 1, paddingRight: 12 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: '#1A1D23', marginBottom: 4 },
  subject: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#4F6EF7', marginBottom: 4 },
  desc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A93A8' },
  joinBtn: { backgroundColor: '#4F6EF7', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  joinBtnText: { color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  emptyText: { fontFamily: 'Inter_400Regular', color: '#8A93A8', textAlign: 'center', marginTop: 40 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', margin: 16, marginBottom: 0, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14 }
});
