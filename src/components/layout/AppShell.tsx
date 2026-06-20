import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { cn } from '@/lib/utils';

interface AppShellProps {
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noHeader?: boolean;
  noNav?: boolean;
}

export function AppShell({
  title,
  subtitle,
  headerRight,
  children,
  className,
  noHeader,
  noNav,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {!noHeader && (
        <Header title={title} subtitle={subtitle} right={headerRight} />
      )}
      <main
        className={cn(
          'flex-1 overflow-y-auto',
          !noNav && 'pb-20',
          className
        )}
      >
        {children}
      </main>
      {!noNav && <BottomNav />}
    </div>
  );
}
