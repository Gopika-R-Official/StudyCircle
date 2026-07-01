import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'groupMembers'), orderBy('streak', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      const uniqueUsers = {};
      data.forEach(item => {
        if (!uniqueUsers[item.userId] || uniqueUsers[item.userId].streak < item.streak) {
          uniqueUsers[item.userId] = item;
        }
      });
      const sortedUnique = Object.values(uniqueUsers).sort((a,b) => b.streak - a.streak);
      setLeaders(sortedUnique);
    });
    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Top Scholars</Text>
      </View>
      <FlatList
        data={leaders}
        keyExtractor={item => item.userId}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={[styles.card, index < 3 && styles.topCard]}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <View style={styles.info}>
              <Text style={styles.name}>{item.userName || `User ${item.userId.slice(0,5)}`}</Text>
              <Text style={styles.groupName}>{item.groupName}</Text>
            </View>
            <Text style={styles.streak}>🔥 {item.streak || 0}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 28, color: '#1A1D23' },
  list: { padding: 24, paddingTop: 0 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  topCard: { borderWidth: 1, borderColor: '#FFD700', backgroundColor: '#FFFAF0' },
  rank: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#8A93A8', width: 40 },
  info: { flex: 1, paddingLeft: 12 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#1A1D23' },
  groupName: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#4F6EF7' },
  streak: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: '#FF9500' }
});
