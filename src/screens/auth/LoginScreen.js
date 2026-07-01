import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth context will navigate to MainNavigator
    } catch (error) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Welcome Back</Text>
          
          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} placeholder="you@gmail.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
          
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  scroll: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 24, left: 24, zIndex: 10 },
  backText: { color: '#4F6EF7', fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 28, color: '#1A1D23', marginBottom: 32, marginTop: 40 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A1D23', marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 16, marginBottom: 20, fontFamily: 'Inter_400Regular', fontSize: 16 },
  button: { backgroundColor: '#4F6EF7', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 16 },
});
