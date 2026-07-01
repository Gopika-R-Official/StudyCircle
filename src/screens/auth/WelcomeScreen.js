import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>StudyCircle</Text>
        <Text style={styles.tagline}>Study together, grow faster.</Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.primaryButtonText}>Sign up with email</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryButtonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 36, color: '#1A1D23', marginBottom: 8 },
  tagline: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#8A93A8' },
  footer: { padding: 24, paddingBottom: 40 },
  primaryButton: { backgroundColor: '#4F6EF7', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  primaryButtonText: { color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  secondaryButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  secondaryButtonText: { color: '#1A1D23', fontFamily: 'Inter_600SemiBold', fontSize: 16 },
});
