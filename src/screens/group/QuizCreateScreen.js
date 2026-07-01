import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';
import { genAI } from '../../config/gemini';

export default function QuizCreateScreen({ route, navigation }) {
  const { groupId } = route.params;
  const { user } = useContext(AuthContext);
  
  const [mode, setMode] = useState('AI'); // 'AI' or 'Custom'
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState('5');
  const [loading, setLoading] = useState(false);

  const handleAIGenerate = async () => {
    if (!topic.trim()) {
      Alert.alert('Error', 'Please enter a topic.');
      return;
    }
    const count = parseInt(numQuestions);
    if (isNaN(count) || count < 1 || count > 20) {
      Alert.alert('Error', 'Please enter a valid number of questions (1-20).');
      return;
    }

    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Generate a ${count}-question multiple choice quiz about "${topic}". 
      Return ONLY a valid JSON array. Each object in the array must have:
      - "question": a string
      - "options": an array of exactly 4 strings
      - "correctOptionIndex": an integer (0-3) indicating the correct answer.
      Do not include markdown blocks or any other text, just the JSON array.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      
      let questions = JSON.parse(text);

      await addDoc(collection(db, 'quizzes'), {
        groupId,
        title: `${topic} Quiz (AI)`,
        type: 'MCQ',
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        questions
      });

      Alert.alert('Success', 'AI Quiz generated and published successfully!');
      navigation.goBack();
    } catch (e) {
      console.warn("Gemini API failed, falling back to mock data", e);
      
      // Fallback dummy quiz so the user can test the UI
      let mockQuestions = [];
      for (let i=0; i<count; i++) {
        mockQuestions.push({
          question: `Sample Question ${i+1} about ${topic}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctOptionIndex: Math.floor(Math.random() * 4)
        });
      }

      await addDoc(collection(db, 'quizzes'), {
        groupId,
        title: `${topic} Quiz (Mock)`,
        type: 'MCQ',
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        questions: mockQuestions
      });

      Alert.alert('API Error', 'The Gemini API failed (likely an unactivated key or region issue), but a Mock Quiz was generated so you can test the UI!');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Quiz</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, mode === 'AI' && styles.toggleActive]}
            onPress={() => setMode('AI')}
          >
            <Text style={[styles.toggleText, mode === 'AI' && styles.toggleTextActive]}>AI Generator</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, mode === 'Custom' && styles.toggleActive]}
            onPress={() => setMode('Custom')}
          >
            <Text style={[styles.toggleText, mode === 'Custom' && styles.toggleTextActive]}>Custom (Manual)</Text>
          </TouchableOpacity>
        </View>

        {mode === 'AI' ? (
          <View style={styles.form}>
            <Text style={styles.label}>Quiz Topic</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. World War II, React Native, Thermodynamics" 
              value={topic}
              onChangeText={setTopic}
            />
            
            <Text style={styles.label}>Number of Questions (1-20)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="5" 
              value={numQuestions}
              onChangeText={setNumQuestions}
              keyboardType="number-pad"
            />
            
            <TouchableOpacity style={styles.generateBtn} onPress={handleAIGenerate} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.generateBtnText}>Generate with Gemini ✨</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Custom Quizzes coming soon.</Text>
            <Text style={styles.subtext}>For now, please use the AI Generator.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: { padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#4F6EF7', fontFamily: 'Inter_600SemiBold', fontSize: 16, marginRight: 16 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#1A1D23' },
  scroll: { padding: 16 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 8, padding: 4, marginBottom: 24 },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 6 },
  toggleActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  toggleText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#8A93A8' },
  toggleTextActive: { color: '#1A1D23' },
  form: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1A1D23', marginBottom: 8 },
  input: { backgroundColor: '#F7F9FC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontFamily: 'Inter_400Regular', fontSize: 16, marginBottom: 16 },
  generateBtn: { backgroundColor: '#4F6EF7', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  generateBtnText: { color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  subtext: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A93A8', marginTop: 4 }
});
