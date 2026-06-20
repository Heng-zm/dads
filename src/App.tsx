import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';
import { LoadingScreen, NotInTelegramScreen, ErrorScreen } from './components/common';
import { Dashboard, DashboardSkeleton } from './pages/Dashboard';
import { Groups } from './pages/Groups';
import { GroupDetail } from './pages/GroupDetail';
import { ScannerTest } from './pages/ScannerTest';
import { Feedback } from './pages/Feedback';
import { Settings } from './pages/Settings';
import { DeveloperDashboard } from './pages/DeveloperDashboard';
import { useTelegram } from './hooks/useTelegram';
import { useEffect } from 'react';

function App() {
  const { isReady } = useTelegram();
  const { state, retry, user } = useAuth();

  // Apply system dark mode if not in Telegram
  useEffect(() => {
    if (!window.Telegram?.WebApp?.initData) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) document.documentElement.classList.add('dark');
    }
  }, []);

  if (!isReady || state.status === 'idle') {
    return <LoadingScreen />;
  }

  if (state.status === 'no-telegram') {
    return <NotInTelegramScreen />;
  }

  if (state.status === 'loading') {
    return <LoadingScreen message="Authenticating…" />;
  }

  if (state.status === 'error') {
    return <ErrorScreen message={state.message} onRetry={retry} />;
  }

  // state.status === 'authenticated'
  if (!user) return <DashboardSkeleton />;

  const isDev = user.is_developer || user.is_owner;

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:chatId" element={<GroupDetail />} />
          <Route path="/scan" element={<ScannerTest />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/settings" element={<Settings />} />
          {isDev && (
            <Route path="/developer" element={<DeveloperDashboard />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          classNames: {
            toast: 'bg-background border text-foreground shadow-lg rounded-xl',
            description: 'text-muted-foreground',
          },
        }}
      />
    </>
  );
}

export default App;
