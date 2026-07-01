# StudyCircle 📚

StudyCircle is a modern, real-time study group application built with **React Native (Expo SDK 57)** and powered by **Firebase** and **Google Gemini AI**. 

It allows students to join public groups, chat in real-time, share visual notes, track their daily study streaks, and participate in AI-generated multiple-choice quizzes to earn leaderboard points!

## ✨ Key Features

- **Real-time Chat**: Powered by Firebase Realtime Database for instantaneous messaging.
- **AI Quizzes**: Admins can generate custom MCQ quizzes instantly by providing a topic to Google's Gemini 1.5 Flash AI.
- **Smart Note Attachments**: Share photos directly in your study groups using our Base64 image compression workaround (saving storage costs).
- **Streak & Habit Tracking**: Check-in daily to build your streak and climb the global leaderboard.
- **Member Management**: Admins can instantly invite members by entering their `@gmail.com` address.
- **Full Safe Area Support**: Built meticulously with React Navigation's native Safe Area context to seamlessly adapt to notches, dynamic islands, and Android navigation bars.

## 🛠 Tech Stack

- **Frontend**: React Native, Expo (SDK 57)
- **Navigation**: React Navigation (Native Stack, Bottom Tabs, Material Top Tabs)
- **Backend / DB**: Firebase (Authentication, Firestore, Realtime Database)
- **AI**: Google Generative AI (`@google/generative-ai`)
- **Storage**: AsyncStorage (for local device state)

## 🚀 Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Gopika-R-Official/StudyCircle.git
   cd StudyCircle
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Firebase:**
   - Create a Firebase project.
   - Enable Authentication (Email/Password), Firestore, and Realtime Database.
   - Replace the config block in `src/config/firebase.js` with your own Firebase keys.

4. **Configure Gemini AI:**
   - Go to Google AI Studio and generate an API key.
   - Paste your `AIzaSy...` key into `src/config/gemini.js`.

5. **Start the app:**
   ```bash
   npx expo start -c
   ```


