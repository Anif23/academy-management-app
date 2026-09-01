import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  // The real session lives in an httpOnly cookie the frontend can't read
  // directly, so this flag is set once App.tsx has asked the server
  // "am I actually still logged in?" — until then, ProtectedRoute must not
  // trust whatever was last persisted to localStorage.
  hasCheckedSession: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
  setSessionChecked: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasCheckedSession: false,
      login: (user) => set({ user, isAuthenticated: true, hasCheckedSession: true }),
      logout: () => set({ user: null, isAuthenticated: false, hasCheckedSession: true }),
      updateUser: (patch) => set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
      setSessionChecked: () => set({ hasCheckedSession: true }),
    }),
    {
      name: 'academypro:auth',
      // Never persist hasCheckedSession — every fresh page load must
      // re-verify against the server before trusting anything.
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
