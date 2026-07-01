import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

export default function NotesTab({ route }) {
  const { groupId } = route.params;
  const { user, userData } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'notes'), where('groupId', '==', groupId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      data.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
      setNotes(data);
    });
    return unsubscribe;
  }, [groupId]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1, 
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 600 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      setSelectedImage(`data:image/jpeg;base64,${manipResult.base64}`);
    }
  };

  const postNote = async () => {
    if (!inputText.trim() && !selectedImage) return;
    try {
      await addDoc(collection(db, 'notes'), {
        groupId,
        authorId: user.uid,
        authorName: userData?.name || 'User',
        content: inputText.trim(),
        attachmentUrl: selectedImage,
        isPinned: false,
        createdAt: new Date().toISOString()
      });
      setInputText('');
      setSelectedImage(null);
    } catch (e) {
      Alert.alert('Error', 'Could not post note.');
    }
  };

  const togglePin = async (noteId, currentPinned) => {
    try {
      await updateDoc(doc(db, 'notes', noteId), {
        isPinned: !currentPinned
      });
    } catch (e) {
      Alert.alert('Error', 'Could not pin note.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={100}>
      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.noteCard, item.isPinned && styles.pinnedCard]}>
            <View style={styles.noteHeader}>
              <Text style={styles.author}>{item.authorName}</Text>
              <TouchableOpacity onPress={() => togglePin(item.id, item.isPinned)}>
                <Text style={{ fontSize: 18 }}>{item.isPinned ? '📌' : '📍'}</Text>
              </TouchableOpacity>
            </View>
            {item.content ? <Text style={styles.content}>{item.content}</Text> : null}
            {item.attachmentUrl && (
              <Image source={{ uri: item.attachmentUrl }} style={styles.attachment} />
            )}
          </View>
        )}
      />
      <View style={styles.footer}>
        {selectedImage && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
              <Ionicons name="close-circle" size={24} color="#F75A5A" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="#8A93A8" />
          </TouchableOpacity>
          <TextInput 
            style={styles.input} 
            placeholder="Share a note or photo..." 
            value={inputText} 
            onChangeText={setInputText} 
            multiline 
          />
          <TouchableOpacity style={styles.postBtn} onPress={postNote}>
            <Text style={styles.postBtnText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  list: { padding: 16 },
  noteCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  pinnedCard: { borderColor: '#4F6EF7', backgroundColor: '#F0F4FF' },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  author: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A1D23' },
  content: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#1A1D23', marginBottom: 8 },
  attachment: { width: '100%', height: 200, borderRadius: 8, marginTop: 8, resizeMode: 'cover' },
  footer: { backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E2E8F0' },
  previewContainer: { padding: 16, paddingBottom: 0, flexDirection: 'row', alignItems: 'flex-start' },
  previewImage: { width: 100, height: 100, borderRadius: 8 },
  removeImageBtn: { marginLeft: -12, marginTop: -12, backgroundColor: '#FFF', borderRadius: 12 },
  inputContainer: { flexDirection: 'row', padding: 16, alignItems: 'flex-end' },
  photoBtn: { padding: 8, marginRight: 8, paddingBottom: 10 },
  input: { flex: 1, backgroundColor: '#F7F9FC', borderRadius: 8, padding: 12, maxHeight: 100, fontFamily: 'Inter_400Regular', fontSize: 16 },
  postBtn: { marginLeft: 12, justifyContent: 'center', backgroundColor: '#4F6EF7', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, marginBottom: 2 },
  postBtnText: { color: '#FFF', fontFamily: 'Inter_600SemiBold' }
});
