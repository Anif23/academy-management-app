import { create } from 'zustand';

interface BrandingState {
  appName: string;
  tagline: string;
  logoDataUrl: string;
  hasLoaded: boolean;
  setBranding: (patch: Partial<Pick<BrandingState, 'appName' | 'tagline' | 'logoDataUrl'>>) => void;
  markLoaded: () => void;
}

const DEFAULTS = {
  appName: 'Academy Management',
  tagline: 'For Managing Everything',
  logoDataUrl: '',
};

// Server-backed, not localStorage: branding is set by one admin and must
// look the same for every admin on every device/browser, not just
// whoever's browser last saved it. See services/brandingApi.ts for the
// fetch that hydrates this on app load (works pre-login too, since the
// login screen needs the logo/app name before anyone is authenticated).
export const useBrandingStore = create<BrandingState>()((set) => ({
  ...DEFAULTS,
  hasLoaded: false,
  setBranding: (patch) => set((state) => ({ ...state, ...patch })),
  markLoaded: () => set({ hasLoaded: true }),
}));
