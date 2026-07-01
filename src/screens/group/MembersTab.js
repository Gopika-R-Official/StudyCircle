import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { collection, query, where, onSnapshot, getDocs, setDoc, doc } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, rtdb } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

export default function MembersTab({ route }) {
  const { groupId, groupName, groupSubject } = route.params;
  const { user } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [presenceMap, setPresenceMap] = useState({});
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'groupMembers'), where('groupId', '==', groupId));
    const unsubMembers = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setMembers(data);
    });

    const presenceRef = ref(rtdb, `presence/${groupId}`);
    const unsubPresence = onValue(presenceRef, (snapshot) => {
      if (snapshot.val()) setPresenceMap(snapshot.val());
      else setPresenceMap({});
    });

    return () => {
      unsubMembers();
      unsubPresence();
    };
  }, [groupId]);

  const currentUserMember = members.find(m => m.userId === user?.uid);
  const isAdmin = currentUserMember?.role === 'Admin';

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const q = query(collection(db, 'users'), where('email', '==', inviteEmail.trim().toLowerCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        Alert.alert('Not Found', 'No user found with that email address.');
        setInviting(false);
        return;
      }
      
      const invitedUser = snap.docs[0].data();
      const invitedUserId = snap.docs[0].id;
      
      const existingMember = members.find(m => m.userId === invitedUserId);
      if (existingMember) {
        Alert.alert('Already a member', 'This user is already in the group.');
        setInviting(false);
        return;
      }

      await setDoc(doc(db, 'groupMembers', `${groupId}_${invitedUserId}`), {
        groupId,
        userId: invitedUserId,
        userName: invitedUser.name || 'User',
        groupName: currentUserMember?.groupName || 'Study Group',
        subject: currentUserMember?.subject || 'General',
        role: 'Member',
        joinedAt: new Date().toISOString(),
        streak: 0,
        weeklyScore: 0
      });

      Alert.alert('Success', `${invitedUser.name} added to the group!`);
      setInviteEmail('');
    } catch (e) {
      Alert.alert('Error', 'Could not add member.');
    } finally {
      setInviting(false);
    }
  };

  return (
    <View style={styles.container}>
      {isAdmin && (
        <View style={styles.inviteContainer}>
          <Text style={styles.inviteLabel}>Add Member</Text>
          <View style={styles.inviteRow}>
            <TextInput 
              style={styles.inviteInput} 
              placeholder="User's email address..." 
              value={inviteEmail} 
              onChangeText={setInviteEmail} 
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.inviteBtn} onPress={handleInvite} disabled={inviting}>
              <Text style={styles.inviteBtnText}>{inviting ? 'Adding...' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <FlatList
        data={members}
        keyExtractor={item => item.userId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isOnline = presenceMap[item.userId]?.online;
          return (
            <View style={styles.memberCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.role.charAt(0)}</Text>
                {isOnline && <View style={styles.onlineDot} />}
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.userName || `User ${item.userId.slice(0,5)}`}</Text>
                <Text style={styles.role}>{item.role}</Text>
              </View>
              <View style={styles.stats}>
                <Text style={styles.streak}>🔥 {item.streak || 0}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  list: { padding: 16 },
  memberCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1A1D23' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#34C98B', borderWidth: 2, borderColor: '#FFF' },
  info: { flex: 1 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#1A1D23' },
  role: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A93A8' },
  stats: { alignItems: 'flex-end' },
  streak: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FF9500' },
  inviteContainer: { padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  inviteLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A1D23', marginBottom: 8 },
  inviteRow: { flexDirection: 'row' },
  inviteInput: { flex: 1, backgroundColor: '#F7F9FC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontFamily: 'Inter_400Regular', fontSize: 14 },
  inviteBtn: { backgroundColor: '#4F6EF7', paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginLeft: 8 },
  inviteBtnText: { color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 14 }
});
