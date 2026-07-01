import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

export default function QuizzesTab({ route, navigation }) {
  const { groupId } = route.params;
  const { user } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = onSnapshot(
      query(collection(db, 'groupMembers'), where('groupId', '==', groupId), where('userId', '==', user.uid)),
      (snapshot) => {
        if (!snapshot.empty) {
          setIsAdmin(snapshot.docs[0].data().role === 'Admin');
        }
      }
    );

    // Fetch quizzes
    const q = query(collection(db, 'quizzes'), where('groupId', '==', groupId));
    const unsubQuizzes = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setQuizzes(data);
    });

    return () => {
      checkAdmin();
      unsubQuizzes();
    };
  }, [groupId]);

  return (
    <View style={styles.container}>
      {isAdmin && (
        <TouchableOpacity 
          style={styles.createBtn} 
          onPress={() => navigation.navigate('QuizCreate', { groupId })}
        >
          <Text style={styles.createBtnText}>+ Create New Quiz</Text>
        </TouchableOpacity>
      )}
      
      <FlatList
        data={quizzes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No quizzes available yet.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.quizCard}
            onPress={() => navigation.navigate('QuizTake', { quizId: item.id, quizTitle: item.title, groupId })}
          >
            <Text style={styles.quizTitle}>{item.title}</Text>
            <Text style={styles.quizInfo}>{item.questions?.length || 0} Questions • {item.type}</Text>
            <Text style={styles.quizDate}>Created {new Date(item.createdAt).toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  list: { padding: 16 },
  createBtn: { backgroundColor: '#4F6EF7', margin: 16, marginBottom: 0, padding: 16, borderRadius: 12, alignItems: 'center' },
  createBtnText: { color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  quizCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  quizTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: '#1A1D23', marginBottom: 4 },
  quizInfo: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#4F6EF7', marginBottom: 4 },
  quizDate: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A93A8' },
  emptyText: { fontFamily: 'Inter_400Regular', color: '#8A93A8', textAlign: 'center', marginTop: 40 }
});
