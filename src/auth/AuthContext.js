import { createContext, useContext, useEffect, useState } from 'react';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '../Firebase'; // Ensure proper Firebase imports

// Create an Auth context
const AuthContext = createContext();

// Custom hook to access the auth context
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null); // State to hold the current user
  const [loading, setLoading] = useState(true); // Loading state for waiting on auth

  // Auth state observer to listen to changes in the authentication state
  useEffect(() => {
    // Firebase auth state change listener
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log('Auth state changed, current user:', user); // Log the user for debugging
      setCurrentUser(user); // Update the current user state
      setLoading(false); // Set loading to false once auth state is resolved
    });

    // Cleanup the listener when the component unmounts
    return unsubscribe;
  }, []); // Empty dependency array ensures this runs only once after initial render

  // Sign up function using Firebase auth
  const signup = (email, password) => {
    console.log(`Attempting to sign up with email: ${email}`);
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('Signup successful:', userCredential.user);
        return userCredential;
      })
      .catch((error) => {
        console.error('Signup error:', error.message);
        throw error; // Rethrow the error for handling in the UI
      });
  };

  // Login function using Firebase auth
  const login = (email, password) => {
    console.log(`Attempting to log in with email: ${email}`);
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('Login successful:', userCredential.user);
        return userCredential;
      })
      .catch((error) => {
        console.error('Login error:', error.message);
        throw error; // Rethrow the error for handling in the UI
      });
  };

  // Logout function using Firebase auth
  const logout = () => {
    console.log('Logging out...');
    return signOut(auth)
      .then(() => {
        console.log('Logout successful');
      })
      .catch((error) => {
        console.error('Logout error:', error.message);
        throw error; // Rethrow the error for handling in the UI
      });
  };

  // Providing values to the context
  const value = {
    currentUser, // Current user information
    signup, // Sign-up function
    login, // Login function
    logout, // Logout function
    loading, // Loading state to indicate whether we're waiting for auth state
  };

  // Render the provider with children, but only after loading is complete
  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Only render children once loading is complete */}
    </AuthContext.Provider>
  );
}
