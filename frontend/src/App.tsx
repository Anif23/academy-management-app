import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from './routes/AppRoutes';
import { applyThemeClass, useThemeStore } from './store/themeStore';
import { useBrandingStore } from './store/brandingStore';
import { useAuthStore } from './store/authStore';
import { authApi } from './services/authApi';
import { brandingApi } from './services/brandingApi';
import { httpClient } from './services/httpClient';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const themeMode = useThemeStore((s) => s.mode);
  const appName = useBrandingStore((s) => s.appName);
  const setBranding = useBrandingStore((s) => s.setBranding);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  // Branding lives on the server (see brandingStore.ts) — fetch it once on
  // load. This works even before login, since the login screen itself
  // shows the app name/logo. Never blocks rendering; the store's own
  // defaults show until this resolves.
  useEffect(() => {
    brandingApi
      .get()
      .then((data) => {
        const resolvedLogo = data.logoUrl
          ? /^https?:\/\//.test(data.logoUrl)
            ? data.logoUrl
            : `${httpClient.defaults.baseURL?.replace(/\/api\/?$/, '')}${data.logoUrl}`
          : '';
        setBranding({ appName: data.appName, tagline: data.tagline, logoDataUrl: resolvedLogo });
      })
      .catch(() => {
        // Fall back to the store's built-in defaults — never block the app
        // from rendering just because branding couldn't be fetched.
      });
    // Pick up permission changes an admin made while this tab was open.
    const refresh = () => {
      if (document.visibilityState === 'visible') authApi.me().then((user) => login(user)).catch(() => undefined);
    };
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyThemeClass(themeMode);
    if (themeMode !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyThemeClass('system');
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [themeMode]);

  useEffect(() => {
    document.title = appName;
  }, [appName]);

  // The actual session lives in an httpOnly cookie, invisible to JS, so on
  // every fresh load we ask the server who (if anyone) is logged in rather
  // than trusting whatever was last cached in localStorage.
  useEffect(() => {
    authApi
      .me()
      .then((user) => login(user))
      .catch(() => logout());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        basename='/academy-app'
      >
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
