import { Link, useLocation } from 'react-router-dom';
import { Home, Shield, ScanLine, MessageSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hapticSelection } from '@/lib/telegram';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/groups', icon: Shield, label: 'Groups' },
  { to: '/scan', icon: ScanLine, label: 'Scan' },
  { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);

          return (
            <Link
              key={to}
              to={to}
              onClick={() => hapticSelection()}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 px-1 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'flex h-6 w-6 items-center justify-center rounded-md transition-all',
                isActive && 'bg-primary/10 scale-110'
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={cn('font-medium', isActive && 'font-semibold')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
