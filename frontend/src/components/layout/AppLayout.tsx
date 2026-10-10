import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from './ToastContainer';
import { PageTransition } from './PageTransition';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Visually hidden until focused — lets keyboard/screen-reader users
          jump past the sidebar straight to the page content. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-popover"
      >
        Skip to main content
      </a>

      <Sidebar />

      <div className="min-w-0 lg:ml-64">
        <Topbar />

        <main id="main-content" tabIndex={-1} className="px-4 py-6 outline-none sm:px-6 lg:px-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
