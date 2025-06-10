import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { create } from 'zustand';

// Initialize Firebase with your config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cashlyzer.com/api';

interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getAuthHeaders: () => { Authorization: string } | null;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (token) {
        // Sign in with the custom token
        const userCredential = await signInWithCustomToken(auth, token);
        const idToken = await userCredential.user.getIdToken();
        
        // Store the ID token
        localStorage.setItem("idToken", idToken);
        set({ user: userCredential.user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("idToken");
      set({ user: null, loading: false, error: "Failed to initialize auth" });
    }
  },

  signup: async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to sign up");
      }

      const data = await response.json();

      if (!data.token) {
        throw new Error("No token received from server");
      }

      // Store the JWT token
      localStorage.setItem("token", data.token);
      set({ user: data.user, loading: false, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to sign up", loading: false });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to login");
      }

      const data = await response.json();

      if (!data.token) {
        throw new Error("No token received from server");
      }

      // Store the JWT token
      localStorage.setItem("token", data.token);
      set({ user: data.user, loading: false, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to login", loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem("token");
      set({ user: null, loading: false, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to logout", loading: false });
      throw error;
    }
  },

  getAuthHeaders: () => {
    const idToken = localStorage.getItem("idToken");
    
    if (!idToken) return null;
    
    return { Authorization: `Bearer ${idToken}` };
  },
}));

export const useRequireAuth = () => {
  const { user, loading, getAuthHeaders } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  return { user, loading, getAuthHeaders };
};

export const useAuth = () => {
  const { user, loading, error, signup, login, logout, getAuthHeaders } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);
  
  return {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    getAuthHeaders,
  };
};