import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

// Initialize Firebase app and services (client-side only)
let app = null;
if (typeof window !== "undefined") {
  app = initializeApp(firebaseConfig);
}

export const db = app ? getFirestore(app) : null;
export const auth = typeof window !== "undefined" && app ? getAuth(app) : null;
export const googleProvider = typeof window !== "undefined" && app ? new GoogleAuthProvider() : null;
export const analytics = typeof window !== "undefined" && app ? getAnalytics(app) : null;

export const logFirebaseEvent = (eventName: string, params?: object) => {
    if (analytics) {
        logEvent(analytics, eventName, params);
    }
};