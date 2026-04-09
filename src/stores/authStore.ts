import { create } from 'zustand';
import type { User } from '@/types/database';
import type { Session } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => set({ user: null, session: null, isLoading: false }),
}));

export const selectIsAuthenticated = (state: AuthStore) => !!state.session;
export const selectIsAdmin = (state: AuthStore) => state.user?.role === 'admin';
