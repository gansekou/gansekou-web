import { initializeApp, getApps } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
} from "firebase/auth";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Firebase Auth
export const firebaseAuth = getAuth(app);

export const firebaseAuthReady =
  typeof window !== "undefined"
    ? setPersistence(firebaseAuth, browserLocalPersistence)
    : Promise.resolve();

// Google Auth
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Firebase Analytics
let analyticsInstance: Analytics | null = null;

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") {
    console.log("[GA4] Exécution côté serveur");
    return null;
  }

  console.log(
    "[GA4] measurementId:",
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  );

  const supported = await isSupported();

  console.log("[GA4] Analytics supported:", supported);

  if (!supported) {
    return null;
  }

  if (analyticsInstance) {
    return analyticsInstance;
  }

  try {
    analyticsInstance = getAnalytics(app);

    console.log("[GA4] Analytics initialisé");

    return analyticsInstance;
  } catch (error) {
    console.error("[GA4] Erreur initialisation:", error);
    return null;
  }
}
