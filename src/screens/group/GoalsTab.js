import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

export default function GoalsTab({ route }) {
  const { groupId } = route.params;
  const { user } = useContext(AuthContext);
  const [checkedIn, setCheckedIn] = useState(false);
  const [streak, setStreak] = useState(0);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchGoalData = async () => {
      try {
        const memberRef = doc(db, 'groupMembers', `${groupId}_${user.uid}`);
        const memberSnap = await getDoc(memberRef);
        if (memberSnap.exists()) {
          const data = memberSnap.data();
          setStreak(data.streak || 0);
          if (data.lastCheckIn === today) {
            setCheckedIn(true);
          }
        }
      } catch (e) {
        console.error("Error fetching goals:", e);
      }
    };
    fetchGoalData();
  }, [groupId, user.uid, today]);

  const handleCheckIn = async () => {
    if (checkedIn) return;
    try {
      const memberRef = doc(db, 'groupMembers', `${groupId}_${user.uid}`);
      await updateDoc(memberRef, {
        lastCheckIn: today,
        streak: streak + 1,
        weeklyScore: (streak + 1) * 10
      });
      setStreak(streak + 1);
      setCheckedIn(true);
    } catch (e) {
      Alert.alert('Error', 'Could not check in.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Daily Goal</Text>
        <Text style={styles.subtitle}>Check in every day to keep your streak alive!</Text>
        
        <View style={styles.streakCircle}>
          <Text style={styles.streakNum}>{streak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, checkedIn && styles.buttonDisabled]} 
          onPress={handleCheckIn}
          disabled={checkedIn}
        >
          <Text style={styles.buttonText}>{checkedIn ? 'Checked In! ✅' : 'Check In Today'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC', padding: 24, justifyContent: 'center' },
  card: { backgroundColor: '#FFF', padding: 24, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 24, color: '#1A1D23', marginBottom: 8 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A93A8', textAlign: 'center', marginBottom: 32 },
  streakCircle: { width: 160, height: 160, borderRadius: 80, borderWidth: 8, borderColor: '#34C98B', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  streakNum: { fontFamily: 'Poppins_600SemiBold', fontSize: 48, color: '#34C98B' },
  streakLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#8A93A8' },
  button: { backgroundColor: '#4F6EF7', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#E2E8F0' },
  buttonText: { color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 16 }
});
