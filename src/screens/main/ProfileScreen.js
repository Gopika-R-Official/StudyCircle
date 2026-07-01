import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { doc, setDoc, writeBatch, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, userData, refreshUserData } = useContext(AuthContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [year, setYear] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setInstitution(userData.institution || '');
      setYear(userData.year || '');
    }
  }, [userData]);

  const handleLogout = () => {
    signOut(auth);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    
    setSaving(true);
    try {
      const batch = writeBatch(db);
      
      const userRef = doc(db, 'users', user.uid);
      batch.set(userRef, { name, institution, year }, { merge: true });

      const gmQuery = query(collection(db, 'groupMembers'), where('userId', '==', user.uid));
      const gmSnapshot = await getDocs(gmQuery);
      gmSnapshot.forEach(docSnap => {
        batch.update(docSnap.ref, { userName: name });
      });

      const notesQuery = query(collection(db, 'notes'), where('authorId', '==', user.uid));
      const notesSnapshot = await getDocs(notesQuery);
      notesSnapshot.forEach(docSnap => {
        batch.update(docSnap.ref, { authorName: name });
      });

      await batch.commit();

      await refreshUserData();
      setIsEditing(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
          <Text style={styles.editBtnText}>{isEditing ? (saving ? 'Saving...' : 'Save') : 'Edit'}</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.card}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{userData?.name?.charAt(0) || 'U'}</Text>
          </View>
          
          {isEditing ? (
            <View style={styles.editForm}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} />
              
              <Text style={styles.label}>Institution</Text>
              <TextInput style={styles.input} value={institution} onChangeText={setInstitution} />
              
              <Text style={styles.label}>Year of Study</Text>
              <TextInput style={styles.input} value={year} onChangeText={setYear} />
            </View>
          ) : (
            <>
              <Text style={styles.name}>{userData?.name || 'Student'}</Text>
              <Text style={styles.info}>{userData?.institution} • {userData?.year}</Text>
              <Text style={styles.email}>{user?.email}</Text>
            </>
          )}
        </View>

        {!isEditing && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: { padding: 24, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 28, color: '#1A1D23' },
  editBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#4F6EF7' },
  card: { backgroundColor: '#FFF', margin: 24, padding: 24, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4F6EF7', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { color: '#FFF', fontSize: 32, fontFamily: 'Poppins_600SemiBold' },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 20, color: '#1A1D23', marginBottom: 4 },
  info: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A93A8', marginBottom: 4 },
  email: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#A0AABF' },
  editForm: { width: '100%', marginTop: 12 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#8A93A8', marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#F7F9FC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontFamily: 'Inter_400Regular', fontSize: 14 },
  logoutBtn: { marginHorizontal: 24, paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F75A5A' },
  logoutText: { color: '#F75A5A', fontFamily: 'Inter_600SemiBold', fontSize: 16 }
});
