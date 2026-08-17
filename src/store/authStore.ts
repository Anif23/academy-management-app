import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../types";
import { authApi } from "../services/authApi";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;

  login: (user: AuthUser) => void;
  logout: () => void;

  updateUser: (patch: Partial<AuthUser>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (user) => {
        set({
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      updateUser: async (patch) => {
        const updatedUser = await authApi.updateProfile(patch);

        set({
          user: updatedUser,
        });
      },
    }),
    {
      name: "acadmey:auth",
    },
  ),
);
