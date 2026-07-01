import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ref, push, onValue, update, serverTimestamp } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { rtdb, db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ChatTab({ route }) {
  const { groupId } = route.params;
  const { user, userData } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletedForMe, setDeletedForMe] = useState([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Fetch if user is admin and their deleted messages
    const fetchUserMeta = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'groupMembers', `${groupId}_${user.uid}`));
        if (docSnap.exists() && docSnap.data().role === 'Admin') {
          setIsAdmin(true);
        }
        const localDeleted = await AsyncStorage.getItem(`deleted_${groupId}`);
        if (localDeleted) setDeletedForMe(JSON.parse(localDeleted));
      } catch (e) {
        console.error(e);
      }
    };
    fetchUserMeta();
  }, [groupId, user]);

  useEffect(() => {
    const chatRef = ref(rtdb, `chat/${groupId}`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedMsgs = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(parsedMsgs);
      } else {
        setMessages([]);
      }
    });
    return () => unsubscribe();
  }, [groupId]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const chatRef = ref(rtdb, `chat/${groupId}`);
    await push(chatRef, {
      senderId: user.uid,
      senderName: userData?.name || 'User',
      text: inputText.trim(),
      timestamp: serverTimestamp()
    });
    setInputText('');
  };

  const handleLongPress = (item) => {
    const isMe = item.senderId === user.uid;
    const canDeleteForEveryone = isMe || isAdmin;

    const options = [
      {
        text: 'Delete for me',
        onPress: async () => {
          const newDeleted = [...deletedForMe, item.id];
          setDeletedForMe(newDeleted);
          await AsyncStorage.setItem(`deleted_${groupId}`, JSON.stringify(newDeleted));
        }
      }
    ];

    if (canDeleteForEveryone) {
      options.push({
        text: 'Delete for everyone',
        style: 'destructive',
        onPress: async () => {
          await update(ref(rtdb, `chat/${groupId}/${item.id}`), {
            text: '🚫 This message was deleted',
            isDeleted: true
          });
        }
      });
    }

    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Message Options', 'What would you like to do?', options);
  };

  const visibleMessages = messages.filter(m => !deletedForMe.includes(m.id));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={100}>
      <FlatList
        ref={flatListRef}
        data={visibleMessages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => {
          const isMe = item.senderId === user.uid;
          const isDeleted = item.isDeleted;
          return (
            <TouchableOpacity 
              onLongPress={() => handleLongPress(item)} 
              delayLongPress={200}
              style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}
            >
              {!isMe && <Text style={styles.senderName}>{item.senderName}</Text>}
              <Text style={[
                styles.messageText, 
                isMe ? styles.myText : styles.theirText,
                isDeleted && styles.deletedText
              ]}>{item.text}</Text>
            </TouchableOpacity>
          );
        }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  list: { padding: 16 },
  messageBubble: { padding: 12, borderRadius: 16, marginBottom: 8, maxWidth: '80%' },
  myBubble: { backgroundColor: '#4F6EF7', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#E2E8F0', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  senderName: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#8A93A8', marginBottom: 4 },
  messageText: { fontFamily: 'Inter_400Regular', fontSize: 16 },
  myText: { color: '#FFF' },
  theirText: { color: '#1A1D23' },
  deletedText: { fontStyle: 'italic', color: '#8A93A8' },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E2E8F0', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#F7F9FC', borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, maxHeight: 100, fontFamily: 'Inter_400Regular', fontSize: 16 },
  sendBtn: { backgroundColor: '#4F6EF7', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 12, marginBottom: 2 }
});
