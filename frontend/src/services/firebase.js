// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCLNTjaiAhGHZlrYxQJh9evJJ2SGEcH1t8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skillkollab.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skillkollab",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "skillkollab.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "442805665906",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:442805665906:web:33f43447fceb87790e82eb",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GPT8NQEFJF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);

// Enforce Session Persistence (user must log in again if they close the page/browser)
setPersistence(auth, browserSessionPersistence)
  .catch((error) => console.error("Error setting auth persistence:", error));

export { app, analytics, auth, db };
