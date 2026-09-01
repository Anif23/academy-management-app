import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from './routes/AppRoutes';
import { applyThemeClass, useThemeStore } from './store/themeStore';
import { useBrandingStore } from './store/brandingStore';
import { useAuthStore } from './store/authStore';
import { authApi } from './services/authApi';

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
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

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
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
