import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Mock demo user data
const MOCK_DEMO_USER: FirebaseUser = {
  uid: 'demo-user-id',
  email: 'demo@solardashboard.com',
  displayName: 'Demo User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  phoneNumber: null,
  photoURL: null,
  providerId: 'demo',
  providerData: [],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: async () => { },
  getIdToken: async () => 'mock-id-token',
  getIdTokenResult: async () => ({
    token: 'mock-id-token',
    authTime: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 3600000).toISOString(),
    issuedAtTime: new Date().toISOString(),
    signInProvider: null,
    signInSecondFactor: null,
    claims: {}
  }),
  reload: async () => { },
  toJSON: () => ({})
};

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isDevelopment: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Debug all relevant environment variables
  console.log('Environment Variables:', {
    NODE_ENV: process.env.NODE_ENV,
    DISABLE_REGISTRATION: process.env.REACT_APP_DISABLE_REGISTRATION,
    FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY ? 'exists' : 'missing'
  });

  // More robust check with default value
  const isDevelopment = process.env.REACT_APP_DISABLE_REGISTRATION === 'true' || false;
  console.log('Registration is disabled:', isDevelopment);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update the user's profile
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const loginAsDemo = async () => {
    try {
      setError(null);
      // Set the mock demo user directly
      setUser(MOCK_DEMO_USER);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (user === MOCK_DEMO_USER) {
        // For demo user, just clear the user state
        setUser(null);
      } else {
        await firebaseSignOut(auth);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    loginAsDemo,
    logout,
    resetPassword,
    isDevelopment
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
