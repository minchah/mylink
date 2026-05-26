import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration (replace with your own env variables if needed)
const firebaseConfig = {
  apiKey: "AIzaSyCieMw_oJonE5EQLYiY8ZwDpLCpBoDHolo",
  authDomain: "mylink-dc143.firebaseapp.com",
  projectId: "mylink-dc143",
  storageBucket: "mylink-dc143.firebasestorage.app",
  messagingSenderId: "717095363317",
  appId: "1:717095363317:web:01e1e420b3760259871bbc",
  measurementId: "G-MBRB9T4B96",
};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Helper functions
export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Google sign‑in error:", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign‑out error:", error);
    throw error;
  }
};

export const onAuthStateChangedListener = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};
