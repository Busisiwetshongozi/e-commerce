import { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from '../Firebase';
import { sendTokenToBackend } from './SendTokenToBackend'; // Make sure this uses GET for /api/auth/me

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log('Auth state changed, current user:', user);
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        getBackendUser(user);
      }
    });

    return unsubscribe;
  }, []);

  const getBackendUser = async (user) => {
    try {
      const token = await user.getIdToken();
      const response = await sendTokenToBackend("api/auth/me"); // ✅ Correct endpoint
      setBackendUser(response.user); // Expecting { user: { name, email, ... } }
    } catch (error) {
      console.error('Failed to fetch backend user:', error);
      setBackendUser(null);
    }
  };

  const signup = async (email, password, extraFields) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      const newUser = {
        firebaseUid: user.uid,
        email: user.email,
        name: extraFields.name,
        phone: extraFields.phone,
        address: extraFields.address,
        enabled: true,
      };

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

  const logout = () => {
    console.log('Logging out...');
    return signOut(auth)
      .then(() => {
        console.log('✅ Logout successful');
        setBackendUser(null); // Clear backend user on logout
      })
      .catch(error => {
        console.error('❌ Logout error:', error.message);
        throw error;
      });
  };

  const value = {
    currentUser,
    backendUser,
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
