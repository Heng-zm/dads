import { Shield, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/form-elements';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Loading Screen ───────────────────────────────────────────────────────────
interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Connecting to Telegram…' }: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-bg shadow-lg">
          <Shield className="h-10 w-10 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-primary animate-pulse" />
      </div>

      <div className="text-center">
        <h1 className="text-xl font-bold">EXE Remover</h1>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <Skeleton className="h-14 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

// ─── Not In Telegram Screen ───────────────────────────────────────────────────
export function NotInTelegramScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/20">
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-blue-500" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.026 9.555c-.148.66-.543.823-1.097.512l-3.032-2.234-1.465 1.41c-.162.162-.298.298-.61.298l.217-3.087 5.63-5.086c.245-.217-.053-.337-.38-.12L6.65 13.903l-2.984-.933c-.648-.203-.66-.648.135-.961l11.656-4.495c.54-.197 1.013.12.105.734z"/>
        </svg>
      </div>
      <div>
        <h1 className="text-xl font-bold">Open in Telegram</h1>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
          This app is designed to run as a Telegram Mini App.
          Please open it from the EXE Remover bot in Telegram.
        </p>
      </div>
      <a
        href="https://t.me"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
      >
        Open Telegram
      </a>
    </div>
  );
}

// ─── Error Screen ─────────────────────────────────────────────────────────────
interface ErrorScreenProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Connection Error</h2>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}>
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <div>
        <p className="font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
interface StatusBadgeProps {
  status: boolean | null | undefined;
  trueLabel?: string;
  falseLabel?: string;
  className?: string;
}

export function StatusBadge({
  status,
  trueLabel = 'Active',
  falseLabel = 'Inactive',
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant={status ? 'safe' : 'danger'}
      className={className}
    >
      <span className={cn(
        'mr-1.5 inline-block h-1.5 w-1.5 rounded-full',
        status ? 'bg-green-500' : 'bg-red-500'
      )} />
      {status ? trueLabel : falseLabel}
    </Badge>
  );
}

// ─── Health Dot ───────────────────────────────────────────────────────────────
export function HealthDot({ ok }: { ok?: boolean }) {
  return (
    <span className={cn(
      'inline-flex h-2.5 w-2.5 rounded-full',
      ok === true ? 'bg-green-500' : ok === false ? 'bg-red-500' : 'bg-yellow-500'
    )} />
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
  variant?: 'default' | 'safe' | 'danger' | 'warning';
  loading?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon, variant = 'default', loading, className }: StatCardProps) {
  const variantClasses = {
    default: '',
    safe: 'border-green-200 dark:border-green-900/30',
    danger: 'border-red-200 dark:border-red-900/30',
    warning: 'border-yellow-200 dark:border-yellow-900/30',
  };

  const iconClasses = {
    default: 'bg-primary/10 text-primary',
    safe: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    danger: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  };

  return (
    <Card className={cn('overflow-hidden', variantClasses[variant], className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
            {loading ? (
              <Skeleton className="mt-1 h-7 w-12" />
            ) : (
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {value ?? '—'}
              </p>
            )}
          </div>
          {icon && (
            <div className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              iconClasses[variant]
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Loading skeletons ────────────────────────────────────────────────────────
export function GroupCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TableRowSkeleton({ cols = 3 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 px-2">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
