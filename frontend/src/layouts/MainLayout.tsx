import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../contexts';
import { ToastContainer } from '../components/ui/Toast';
import { ScrollToTop } from '../components/ScrollToTop';

export function MainLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Cargando aplicacion...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-brand-darker to-blue-900 flex">
      <ToastContainer />
      <ScrollToTop />
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-page-enter" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}