import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD4yDmJAJLtHDoSF43XIOcn47Txs-iPECs",
  authDomain: "quem-eu-sou-3816f.firebaseapp.com",
  projectId: "quem-eu-sou-3816f",
  storageBucket: "quem-eu-sou-3816f.firebasestorage.app",
  messagingSenderId: "304623096209",
  appId: "1:304623096209:web:d497f81911ea5e4be54a30",
  measurementId: "G-9T9WS57FJV"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only in browser environment
export const analytics = typeof window !== 'undefined' 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null) 
  : null;

// Helpers
export const collections = {
  users: 'users',
  games: 'games',
  achievements: 'achievements'
} as const; 