// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdsmLTwY1qVPd9LXrxtj39DwX9UkoyxLM",
  authDomain: "basket-abac3.firebaseapp.com",
  projectId: "basket-abac3",
  storageBucket: "basket-abac3.firebasestorage.app",
  messagingSenderId: "127829010111",
  appId: "1:127829010111:web:a77073b440ca0c9d47480a",
  measurementId: "G-6ZZWM5R8K8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
