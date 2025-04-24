// Import Firebase SDK functions from Firebase v9 (modular)
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRfLOe3EobnssCdNaOaIEHNlAfhVSzjgo",
  authDomain: "e-commerce-bd06d.firebaseapp.com",
  projectId: "e-commerce-bd06d",
  storageBucket: "e-commerce-bd06d.firebasestorage.app",
  messagingSenderId: "118611302167",
  appId: "1:118611302167:web:8389d00f9f55a33de60952",
  measurementId: "G-6Z5G4F5SSY"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get Auth instance
const auth = getAuth(app);

// Export the necessary functions
export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut };
