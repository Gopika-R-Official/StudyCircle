import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCe1mVsgR5PdTt2l4JnDqKUym8DGY4_Gi4",
  authDomain: "gops-9919a.firebaseapp.com",
  databaseURL: "https://gops-9919a-default-rtdb.firebaseio.com",
  projectId: "gops-9919a",
  storageBucket: "gops-9919a.firebasestorage.app",
  messagingSenderId: "310900995135",
  appId: "1:310900995135:web:88c4b7ad9ca756a8bb748a"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, rtdb, storage };
