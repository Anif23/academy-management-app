import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BrandingState {
  appName: string;
  tagline: string;
  logoDataUrl: string;
  setBranding: (patch: Partial<Pick<BrandingState, 'appName' | 'tagline' | 'logoDataUrl'>>) => void;
  resetBranding: () => void;
}

const DEFAULTS = {
  appName: 'AcademyPro',
  tagline: 'Student Management',
  logoDataUrl: '',
};

export const useBrandingStore = create<BrandingState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setBranding: (patch) => set((state) => ({ ...state, ...patch })),
      resetBranding: () => set({ ...DEFAULTS }),
    }),
    {
      name: 'academypro:branding',
    },
  ),
);
