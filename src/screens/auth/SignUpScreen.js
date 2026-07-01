import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [year, setYear] = useState('');
  const [institution, setInstitution] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !year || !institution) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      Alert.alert('Invalid Email', 'Only @gmail.com addresses are allowed.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email: email.toLowerCase(),
        year,
        institution,
        createdAt: new Date().toISOString(),
      });
      // Auth context will automatically navigate to MainNavigator
    } catch (error) {
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') msg = 'That email address is already in use!';
      Alert.alert('Sign Up Error', msg);
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
          <Text style={styles.title}>Create Account</Text>
          
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholder="John Doe" value={name} onChangeText={setName} />
          
          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} placeholder="you@gmail.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="Min. 8 characters" value={password} onChangeText={setPassword} secureTextEntry />
          
          <Text style={styles.label}>Year of Study</Text>
          <TextInput style={styles.input} placeholder="e.g. 2nd Year" value={year} onChangeText={setYear} />
          
          <Text style={styles.label}>Institution</Text>
          <TextInput style={styles.input} placeholder="University Name" value={institution} onChangeText={setInstitution} />
          
          <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Signing up...' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  scroll: { padding: 24 },
  backBtn: { marginBottom: 24 },
  backText: { color: '#4F6EF7', fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 28, color: '#1A1D23', marginBottom: 32 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A1D23', marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 16, marginBottom: 20, fontFamily: 'Inter_400Regular', fontSize: 16 },
  button: { backgroundColor: '#4F6EF7', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 16 },
});
