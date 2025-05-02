import { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from '../Firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log('Auth state changed, current user:', user);
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ✅ SIGNUP: Firebase + Java backend
  const signup = async (email, password, name) => {
    try {
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Get Firebase ID token
      const token = await user.getIdToken();

      // 3. Build payload for Java backend
      const newUser = {
        firebaseUid: user.uid,
        email: user.email,
        name: name,
        enabled: true // Optional: depends on your User entity
      };

      // 4. Send to Java backend
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        throw new Error("Failed to create user in backend");
      }

      console.log("✅ User created in Firebase and Java backend");
      return userCredential;
    } catch (error) {
      console.error("❌ Signup error:", error);
      throw error;
    }
  };

  // ✅ LOGIN: Firebase only
  const login = (email, password) => {
    console.log('Logging in user with email:', email);
    return signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        console.log('✅ Login successful:', userCredential.user);
        return userCredential;
      })
      .catch(error => {
        console.error('❌ Login error:', error.message);
        throw error;
      });
  };

  // ✅ LOGOUT
  const logout = () => {
    console.log('Logging out...');
    return signOut(auth)
      .then(() => {
        console.log('✅ Logout successful');
      })
      .catch(error => {
        console.error('❌ Logout error:', error.message);
        throw error;
      });
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
