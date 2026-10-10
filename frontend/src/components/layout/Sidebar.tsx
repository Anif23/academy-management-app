import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, GraduationCap, X } from 'lucide-react';
import { navGroupsForPermissions } from '../../routes/navigation';
import { useUiStore } from '../../store/uiStore';
import { useBrandingStore } from '../../store/brandingStore';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

function SidebarContent({ onNavigate, onClose }: { onNavigate?: () => void; onClose?: () => void }) {
  const appName = useBrandingStore((s) => s.appName);
  const tagline = useBrandingStore((s) => s.tagline);
  const logoDataUrl = useBrandingStore((s) => s.logoDataUrl);
  const permissions = useAuthStore((s) => s.user?.permissions);
  const location = useLocation();
  const groups = useMemo(() => navGroupsForPermissions(permissions), [permissions]);

  // Whichever group contains the current page starts expanded; the rest
  // start collapsed so a long admin menu reads as a handful of labeled
  // sections rather than one long scrolling list.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    groups.forEach((group) => {
      const label = group.label ?? '__top__';
      initial[label] = group.items.some((item) => location.pathname.startsWith(item.path));
    });
    return initial;
  });

  // Keep the active page's group open if the route changes underneath us
  // (e.g. navigating via a link elsewhere in the app, not the sidebar).
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      groups.forEach((group) => {
        const label = group.label ?? '__top__';
        if (group.items.some((item) => location.pathname.startsWith(item.path))) {
          next[label] = true;
        }
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  function toggleGroup(label: string) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-4 sm:px-5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg ${logoDataUrl ? "bg-transparent" : "bg-brand-600 text-white"}`}>
          {logoDataUrl ? <img src={logoDataUrl} alt={appName} className="h-full w-full object-cover" /> : <GraduationCap className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-text-primary">{appName}</p>
          <p className="truncate text-xs leading-tight text-text-muted">{tagline}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {groups.map((group, groupIndex) => {
          const groupKey = group.label ?? '__top__';
          const isOpen = group.label === null || openGroups[groupKey];

          return (
            <div key={groupKey} className={groupIndex > 0 ? 'pt-2' : undefined}>
              {group.label && (
                <button
                  type="button"
                  onClick={() => toggleGroup(groupKey)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  {group.label}
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-180')} />
                </button>
              )}

              <div
                className={cn(
                  'grid transition-all duration-200 ease-out',
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                )}
              >
                <div className="overflow-hidden">
                  <div className="space-y-1 pt-1">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          cn(
                            'animate-sidebar-item',
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                              : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                          )
                        }
                      >
                        <item.icon className="h-4.5 w-4.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border px-4 py-4">
        <p className="text-xs text-text-muted">© 2026 {appName}. All rights reserved.</p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileSidebarOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileSidebarOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen, setMobileSidebarOpen]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 overflow-hidden border-r border-border bg-surface lg:flex">
        <SidebarContent />
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-sidebar-backdrop-in" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative flex h-full w-[82vw] max-w-72 flex-col overflow-hidden bg-surface shadow-2xl animate-sidebar-slide-in">
            <SidebarContent onNavigate={() => setMobileSidebarOpen(false)} onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
