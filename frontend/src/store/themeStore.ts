import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyThemeClass(mode: ThemeMode): void {
  const isDark = resolveIsDark(mode);
  document.documentElement.classList.toggle('dark', isDark);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      setMode: (mode) => {
        applyThemeClass(mode);
        set({ mode });
      },
    }),
    {
      name: 'academypro:theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeClass(state.mode);
      },
    },
  ),
);
