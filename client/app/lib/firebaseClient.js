import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const initializeFirebase = () => {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
};

export const getFirebaseAuth = async() => {
  initializeFirebase();
  
  const auth = getAuth(getApp());
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log("Local persistence set");
  }catch (error) {
    console.log("Error setting local persistence:", error);
  }

  return auth;
};

let firestore;
export const getFirebaseFirestore = () => {
  if(!firestore){
    initializeFirebase();
    firestore = getFirestore(getApp());
  }
  return firestore;
}