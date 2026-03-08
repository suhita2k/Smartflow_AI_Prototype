import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { LiveMonitoring } from './pages/LiveMonitoring';
import { EmergencyCorridor } from './pages/EmergencyCorridor';
import { Analytics } from './pages/Analytics';
import { UserManagement } from './pages/UserManagement';
import { CVCameras } from './pages/CVCameras';
import { LiveMap } from './pages/LiveMap';
import { Settings } from './pages/Settings';

type Page = 'dashboard' | 'monitoring' | 'emergency' | 'analytics' | 'cameras' | 'livemap' | 'users' | 'settings';

function Header({ page, user }: { page: Page; user: { name: string; role: string } | null }) {
  const titles: Record<Page, string> = {
    dashboard: 'Dashboard',
    monitoring: 'Live Monitoring',
    emergency: 'Emergency Corridor',
    analytics: 'Analytics',
    cameras: 'Computer Vision Cameras',
    livemap: 'Live Traffic Map',
    users: 'User Management',
    settings: 'Settings',
  };
  return (
    <div className="h-14 flex-shrink-0 bg-slate-900/80 border-b border-slate-800 backdrop-blur flex items-center px-6 justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className="text-slate-600">SmartFlow AI</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <span className="text-white font-medium">{titles[page]}</span>
      </div>
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative text-slate-500 hover:text-slate-300 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold leading-none">4</span>
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">{user?.name}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500 capitalize">{user?.role}</span>
        </div>
      </div>
    </div>
  );
}

function AppShell() {
  const { user, hasPermission } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return <LoginPage />;

  const renderPage = () => {
    if (page === 'dashboard') return <Dashboard />;
    if (page === 'monitoring') return <LiveMonitoring />;
    if (page === 'emergency') return <EmergencyCorridor />;
    if (page === 'analytics') return <Analytics />;
    if (page === 'cameras') return <CVCameras />;
    if (page === 'livemap') return <LiveMap />;
    if (page === 'users' && hasPermission('manage_users')) return <UserManagement />;
    if (page === 'users') return (
      <div className="flex items-center justify-center h-full p-12">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-white text-xl font-semibold">Access Restricted</h2>
          <p className="text-slate-400 mt-2">You don't have permission to manage users.</p>
        </div>
      </div>
    );
    if (page === 'settings') return <Settings />;
    return null;
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header page={page} user={user} />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
