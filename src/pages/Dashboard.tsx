import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, AlertTriangle, Activity,
  ChevronRight, ScanLine, MessageSquare,
  Code2, Star, Globe
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/form-elements';
import { StatCard, SectionHeader } from '@/components/common';
import { AppShell } from '@/components/layout/AppShell';
import { type UserProfile } from '@/lib/api';
import { getInitials, truncate } from '@/lib/utils';
import { hapticImpact } from '@/lib/telegram';

interface DashboardProps {
  user: UserProfile;
}

export function Dashboard({ user }: DashboardProps) {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Shield,
      label: 'My Groups',
      description: 'Manage linked groups',
      to: '/groups',
      color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20',
    },
    {
      icon: ScanLine,
      label: 'Scanner',
      description: 'Test file name scan',
      to: '/scan',
      color: 'text-green-500 bg-green-100 dark:bg-green-900/20',
    },
    {
      icon: MessageSquare,
      label: 'Feedback',
      description: 'Send us feedback',
      to: '/feedback',
      color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20',
    },
  ];

  if (user.is_developer || user.is_owner) {
    quickActions.push({
      icon: Code2,
      label: 'Dev Dashboard',
      description: 'System overview',
      to: '/developer',
      color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/20',
    });
  }

  return (
    <AppShell title="EXE Remover" subtitle="Security Bot">
      <div className="space-y-4 p-4 animate-slide-in">
        {/* Profile Card */}
        <Card className="overflow-hidden">
          <div className="gradient-bg px-4 py-3">
            <p className="text-xs font-medium text-white/70">Logged in as</p>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                {user.photo_url && <AvatarImage src={user.photo_url} alt={user.first_name} />}
                <AvatarFallback className="text-base">
                  {getInitials(user.first_name, user.last_name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold leading-none">
                    {truncate([user.first_name, user.last_name].filter(Boolean).join(' '), 24)}
                  </h2>
                  {user.is_premium && (
                    <Badge variant="premium" className="gap-0.5">
                      <Star className="h-2.5 w-2.5" />
                      Premium
                    </Badge>
                  )}
                  {user.is_owner && (
                    <Badge variant="default">Owner</Badge>
                  )}
                  {user.is_developer && !user.is_owner && (
                    <Badge variant="info">Dev</Badge>
                  )}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {user.username && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="text-primary">@</span>{user.username}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="text-muted-foreground/60">#</span>{user.telegram_id}
                  </span>
                  {user.language_code && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />{user.language_code.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div>
          <SectionHeader title="Overview" />
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Linked Groups"
              value={user.linked_groups ?? 0}
              icon={<Users className="h-4 w-4" />}
              variant="default"
            />
            <StatCard
              label="Protected"
              value={user.protected_groups ?? 0}
              icon={<Shield className="h-4 w-4" />}
              variant="safe"
            />
            <StatCard
              label="Open Incidents"
              value={user.open_incidents ?? 0}
              icon={<AlertTriangle className="h-4 w-4" />}
              variant={user.open_incidents ? 'warning' : 'default'}
            />
            <StatCard
              label="Risk Flags"
              value={user.risk_count ?? 0}
              icon={<Activity className="h-4 w-4" />}
              variant={user.risk_count ? 'danger' : 'default'}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-1 gap-2">
            {quickActions.map(({ icon: Icon, label, description, to, color }) => (
              <button
                key={to}
                onClick={() => {
                  hapticImpact('light');
                  navigate(to);
                }}
                className="flex items-center gap-3 rounded-xl border bg-card p-3.5 text-left transition-all hover:shadow-sm hover:bg-accent active:scale-[0.98]"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Bot info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">EXE File Remover Bot</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  Automatically detects and removes executable files from your Telegram groups.
                  Add the bot to a group and make it admin to get started.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

// ─── Dashboard Skeleton ───────────────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <AppShell title="EXE Remover">
      <div className="space-y-4 p-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-7 w-10" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
