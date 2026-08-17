import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, Menu, Monitor, Moon, Search, Sun, User, X } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { useUiStore } from '../../store/uiStore';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { useBrandingStore } from '../../store/brandingStore';
import { findNavLabel } from '../../routes/navigation';
import { initials } from '../../utils/format';
import { authApi } from '../../services/authApi';
import { toastSuccess } from '../../store/toastStore';
import { cn } from '../../utils/cn';

const THEME_OPTIONS: Array<{ value: 'light' | 'dark' | 'system'; icon: typeof Sun; label: string }> = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
];

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);
  const user = useAuthStore((s) => s.user);
  const appName = useBrandingStore((s) => s.appName);
  const logout = useAuthStore((s) => s.logout);

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await authApi.logout();
    logout();
    toastSuccess('Logged out successfully.');
    navigate('/login', { replace: true });
  }

  const currentLabel = findNavLabel(location.pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="flex h-16 items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open navigation"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden items-center gap-1.5 text-sm text-text-muted md:flex">
          <span>{appName}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-text-primary">{currentLabel}</span>
        </div>

        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary md:hidden">{currentLabel}</p>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          <div className="hidden md:block md:w-80">
            <GlobalSearch />
          </div>

          <button
            type="button"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
            aria-expanded={mobileSearchOpen}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors md:hidden',
              mobileSearchOpen ? 'bg-surface-hover text-text-primary' : 'text-text-secondary hover:bg-surface-hover',
            )}
          >
            {mobileSearchOpen ? <X className="h-4.5 w-4.5" /> : <Search className="h-4.5 w-4.5" />}
          </button>

          <div className="hidden items-center gap-0.5 rounded-lg border border-border bg-surface-muted p-0.5 sm:flex">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setThemeMode(option.value)}
                aria-label={`${option.label} theme`}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                  themeMode === option.value ? 'bg-surface text-brand-600 shadow-sm' : 'text-text-muted hover:text-text-primary',
                )}
              >
                <option.icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white"
              aria-label="Open profile menu"
            >
              {user ? initials(user.name) : <User className="h-4 w-4" />}
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-popover animate-fade-in">
                <div className="border-b border-border px-3 py-2.5">
                  <p className="truncate text-sm font-medium text-text-primary">{user?.name}</p>
                  <p className="truncate text-xs text-text-muted">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/profile');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-border px-4 py-3 animate-slide-up md:hidden">
          <GlobalSearch onNavigate={() => setMobileSearchOpen(false)} autoFocus />
        </div>
      )}
    </header>
  );
}
