import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

export default function CreateGroupTab({ navigation }) {
  const { user, userData } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !subject) {
      Alert.alert('Error', 'Name and Subject are required.');
      return;
    }
    setLoading(true);
    try {
      const groupRef = await addDoc(collection(db, 'groups'), {
        name, subject, description, isPublic: true, adminId: user.uid, memberCount: 1, createdAt: new Date().toISOString(), lastActivity: new Date().toISOString(),
      });
      
      await setDoc(doc(db, 'groupMembers', `${groupRef.id}_${user.uid}`), {
        groupId: groupRef.id, userId: user.uid, userName: userData?.name || 'User', groupName: name, subject: subject, role: 'Admin', joinedAt: new Date().toISOString(), streak: 0, weeklyScore: 0
      });
      
      navigation.replace('GroupRoom', { groupId: groupRef.id });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={80}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Group Name</Text>
        <TextInput style={styles.input} placeholder="e.g. Calculus 101" value={name} onChangeText={setName} />
        <Text style={styles.label}>Subject</Text>
        <TextInput style={styles.input} placeholder="e.g. Math" value={subject} onChangeText={setSubject} />
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput style={styles.input} placeholder="What is this group about?" value={description} onChangeText={setDescription} multiline />
        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Group'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  scroll: { padding: 24 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A1D23', marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 16, marginBottom: 20, fontFamily: 'Inter_400Regular', fontSize: 16 },
  button: { backgroundColor: '#4F6EF7', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 16 },
});
