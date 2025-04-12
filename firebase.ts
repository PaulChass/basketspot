import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAdsmLTwY1qVPd9LXrxtj39DwX9UkoyxLM",
  authDomain: "basket-abac3.firebaseapp.com",
  projectId: "basket-abac3",
  storageBucket: "basket-abac3.appspot.com",
  messagingSenderId: "127829010111",
  appId: "1:127829010111:web:a77073b440ca0c9d47480a",
  measurementId: "G-6ZZWM5R8K8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // Initialize Firebase Authentication
export default app;