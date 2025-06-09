import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  name: string;
  token: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
})); 