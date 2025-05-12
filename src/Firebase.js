import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDRfLOe3EobnssCdNaOaIEHNlAfhVSzjgo",
  authDomain: "e-commerce-bd06d.firebaseapp.com",
  projectId: "e-commerce-bd06d",
  storageBucket: "e-commerce-bd06d.appspot.com",
  messagingSenderId: "118611302167",
  appId: "1:118611302167:web:8389d00f9f55a33de60952",
  measurementId: "G-6Z5G4F5SSY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// Export all authentication functions and services
export { 
  auth,
  storage,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
};

// Default export if needed
export default { auth, storage };