import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

export default function QuizTakeScreen({ route, navigation }) {
  const { quizId, quizTitle, groupId } = route.params;
  const { user, userData } = useContext(AuthContext);
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'quizzes', quizId));
        if (docSnap.exists()) {
          setQuiz(docSnap.data());
        }
        
        // Check if already submitted
        const subSnap = await getDoc(doc(db, 'quizSubmissions', `${quizId}_${user.uid}`));
        if (subSnap.exists()) {
          setIsSubmitted(true);
          setScore(subSnap.data().score);
          setSelectedAnswers(subSnap.data().answers);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleSelectOption = (index) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: index
    });
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < quiz.questions.length) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }

    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        correctCount += 1;
      }
    });

    try {
      // Save submission
      await setDoc(doc(db, 'quizSubmissions', `${quizId}_${user.uid}`), {
        quizId,
        groupId,
        userId: user.uid,
        userName: userData?.name || 'User',
        score: correctCount,
        total: quiz.questions.length,
        answers: selectedAnswers,
        submittedAt: new Date().toISOString()
      });

      // Update weekly score
      await updateDoc(doc(db, 'groupMembers', `${groupId}_${user.uid}`), {
        weeklyScore: increment(correctCount * 10) // 10 points per correct answer
      });

      setScore(correctCount);
      setIsSubmitted(true);
      Alert.alert('Quiz Completed!', `You scored ${correctCount} out of ${quiz.questions.length}!`);
    } catch (e) {
      Alert.alert('Error', 'Could not submit quiz.');
    }
  };

  if (loading) {
    return <View style={styles.container}><Text style={styles.loadingText}>Loading...</Text></View>;
  }
  if (!quiz) {
    return <View style={styles.container}><Text style={styles.loadingText}>Quiz not found.</Text></View>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{quizTitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {isSubmitted && (
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Your Score</Text>
            <Text style={styles.scoreText}>{score} / {quiz.questions.length}</Text>
          </View>
        )}

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Question {currentQuestionIndex + 1} of {quiz.questions.length}</Text>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === idx;
            const isCorrect = idx === currentQuestion.correctOptionIndex;
            
            let optionStyle = [styles.optionBtn];
            let optionTextStyle = [styles.optionText];
            
            if (isSelected) {
              optionStyle.push(styles.optionSelected);
              optionTextStyle.push(styles.optionTextSelected);
            }
            
            if (isSubmitted) {
              if (isCorrect) {
                optionStyle.push(styles.optionCorrect);
                optionTextStyle.push(styles.optionTextCorrect);
              } else if (isSelected && !isCorrect) {
                optionStyle.push(styles.optionWrong);
                optionTextStyle.push(styles.optionTextWrong);
              }
            }

            return (
              <TouchableOpacity 
                key={idx} 
                style={optionStyle} 
                onPress={() => handleSelectOption(idx)}
                disabled={isSubmitted}
              >
                <Text style={optionTextStyle}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.navButtons}>
          <TouchableOpacity 
            style={[styles.navBtn, currentQuestionIndex === 0 && styles.navBtnDisabled]} 
            disabled={currentQuestionIndex === 0}
            onPress={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
          >
            <Text style={styles.navBtnText}>Previous</Text>
          </TouchableOpacity>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <TouchableOpacity 
              style={[styles.navBtn, styles.submitBtn, isSubmitted && styles.navBtnDisabled]} 
              disabled={isSubmitted}
              onPress={handleSubmit}
            >
              <Text style={styles.navBtnTextSubmit}>{isSubmitted ? 'Submitted' : 'Submit'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.navBtn} 
              onPress={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            >
              <Text style={styles.navBtnText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  loadingText: { fontFamily: 'Inter_400Regular', color: '#8A93A8', textAlign: 'center', marginTop: 100 },
  header: { padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#4F6EF7', fontFamily: 'Inter_600SemiBold', fontSize: 16, marginRight: 16 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1A1D23', flex: 1 },
  scroll: { padding: 16 },
  scoreCard: { backgroundColor: '#E6F4EA', padding: 16, borderRadius: 12, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: '#34C98B' },
  scoreTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1E8E3E', marginBottom: 4 },
  scoreText: { fontFamily: 'Poppins_600SemiBold', fontSize: 24, color: '#1E8E3E' },
  progressContainer: { marginBottom: 16 },
  progressText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#8A93A8' },
  questionCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24 },
  questionText: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: '#1A1D23', marginBottom: 20 },
  optionBtn: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12, backgroundColor: '#F7F9FC' },
  optionSelected: { borderColor: '#4F6EF7', backgroundColor: '#F0F4FF' },
  optionCorrect: { borderColor: '#34C98B', backgroundColor: '#E6F4EA' },
  optionWrong: { borderColor: '#F75A5A', backgroundColor: '#FCE8E8' },
  optionText: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#1A1D23' },
  optionTextSelected: { color: '#4F6EF7', fontFamily: 'Inter_600SemiBold' },
  optionTextCorrect: { color: '#1E8E3E', fontFamily: 'Inter_600SemiBold' },
  optionTextWrong: { color: '#D93025', fontFamily: 'Inter_600SemiBold' },
  navButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  navBtn: { flex: 1, backgroundColor: '#E2E8F0', padding: 16, borderRadius: 12, alignItems: 'center', marginHorizontal: 4 },
  navBtnDisabled: { opacity: 0.5 },
  navBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#1A1D23' },
  submitBtn: { backgroundColor: '#4F6EF7' },
  navBtnTextSubmit: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFF' }
});
