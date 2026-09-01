import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from './ToastContainer';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-surface-muted">
      <Sidebar />

      <div className="min-w-0 lg:ml-64">
        <Topbar />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}