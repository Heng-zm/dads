import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
  right?: React.ReactNode;
}

export function Header({ title = 'EXE Remover', subtitle, className, right }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg shadow-sm">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-none">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {right && <div className="flex items-center">{right}</div>}
      </div>
    </header>
  );
}
