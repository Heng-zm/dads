import { useState } from 'react';
import { Code2, Users, Shield, MessageSquare, Settings, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch, Label, Input, Skeleton, Alert, AlertDescription } from '@/components/ui/form-elements';
import { StatCard, EmptyState } from '@/components/common';
import { AppShell } from '@/components/layout/AppShell';
import { useApi } from '@/hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  getDevOverview, getDevUsers, getDevGroups, getDevFeedback,
  getRuntimeConfig, updateRuntimeConfig, type RuntimeConfig,
} from '@/lib/api';
import { hapticImpact, hapticNotification } from '@/lib/telegram';
import { formatRelativeTime, safeArray } from '@/lib/utils';

export function DeveloperDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AppShell noHeader>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <Button variant="ghost" size="icon" onClick={() => { hapticImpact(); navigate('/'); }}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <Code2 className="h-5 w-5 text-orange-500 shrink-0" />
            <p className="text-sm font-semibold">Developer Dashboard</p>
          </div>
          <Badge variant="warning">OWNER</Badge>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={(v) => { hapticImpact('light'); setActiveTab(v); }}>
          <div className="overflow-x-auto -mx-4 px-4 pb-1">
            <TabsList className="flex w-max gap-1 bg-muted/50 p-1">
              {[
                { value: 'overview', icon: Code2, label: 'Overview' },
                { value: 'users', icon: Users, label: 'Users' },
                { value: 'groups', icon: Shield, label: 'Groups' },
                { value: 'feedback', icon: MessageSquare, label: 'Feedback' },
                { value: 'config', icon: Settings, label: 'Config' },
              ].map(({ value, icon: Icon, label }) => (
                <TabsTrigger key={value} value={value} className="gap-1.5 whitespace-nowrap text-xs px-3">
                  <Icon className="h-3 w-3" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-4">
            <TabsContent value="overview"><OverviewTab /></TabsContent>
            <TabsContent value="users"><UsersTab /></TabsContent>
            <TabsContent value="groups"><GroupsTab /></TabsContent>
            <TabsContent value="feedback"><FeedbackTab /></TabsContent>
            <TabsContent value="config"><ConfigTab /></TabsContent>
          </div>
        </Tabs>
      </div>
    </AppShell>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab() {
  const { data: overview, loading, error, refetch } = useApi(getDevOverview);

  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">System Statistics</p>
        <Button variant="ghost" size="xs" onClick={() => { hapticImpact(); refetch(); }} className="gap-1.5">
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Users" value={loading ? null : overview?.total_users} icon={<Users className="h-4 w-4" />} loading={loading} />
        <StatCard label="Total Groups" value={loading ? null : overview?.total_groups} icon={<Shield className="h-4 w-4" />} loading={loading} />
        <StatCard label="Active (24h)" value={loading ? null : overview?.active_users_24h} icon={<Users className="h-4 w-4" />} variant="safe" loading={loading} />
        <StatCard label="Incidents" value={loading ? null : overview?.total_incidents} icon={<Code2 className="h-4 w-4" />} variant="warning" loading={loading} />
      </div>

      {overview && (
        <Card>
          <CardContent className="p-4 space-y-2">
            {overview.bot_version && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bot Version</span>
                <span className="font-mono">{overview.bot_version}</span>
              </div>
            )}
            {overview.uptime && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uptime</span>
                <span>{overview.uptime}</span>
              </div>
            )}
            {overview.protected_groups !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Protected Groups</span>
                <span>{overview.protected_groups}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Users ────────────────────────────────────────────────────────────────────
function UsersTab() {
  const { data: users, loading, error } = useApi(getDevUsers);
  if (loading) return <div className="space-y-2">{[1,2,3,4].map(i=><Skeleton key={i} className="h-16"/>)}</div>;
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-2">
      {safeArray(users).length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title="No users found" />
      ) : safeArray(users).map(user => (
        <Card key={user.telegram_id}>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <span className="text-xs font-semibold text-primary">
                  {(user.first_name ?? 'U').charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {user.first_name ?? 'Unknown'}
                  {user.username && <span className="text-muted-foreground"> @{user.username}</span>}
                </p>
                <p className="text-xs text-muted-foreground font-mono">ID: {user.telegram_id}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {user.is_premium && <Badge variant="premium" className="text-[10px]">Premium</Badge>}
                {user.group_count !== undefined && (
                  <span className="text-xs text-muted-foreground">{user.group_count} groups</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Groups ───────────────────────────────────────────────────────────────────
function GroupsTab() {
  const { data: groups, loading, error } = useApi(getDevGroups);
  if (loading) return <div className="space-y-2">{[1,2,3].map(i=><Skeleton key={i} className="h-16"/>)}</div>;
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-2">
      {safeArray(groups).length === 0 ? (
        <EmptyState icon={<Shield className="h-6 w-6" />} title="No groups found" />
      ) : safeArray(groups).map(group => (
        <Card key={String(group.chat_id)}>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{group.title ?? 'Unknown Group'}</p>
                <p className="text-xs text-muted-foreground font-mono">{String(group.chat_id)}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge variant={group.protection_enabled ? 'safe' : 'danger'} className="text-[10px]">
                  {group.protection_enabled ? 'Protected' : 'Off'}
                </Badge>
                {group.incident_count !== undefined && (
                  <span className="text-xs text-muted-foreground">{group.incident_count} incidents</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Feedback ─────────────────────────────────────────────────────────────────
function FeedbackTab() {
  const { data: feedback, loading, error } = useApi(getDevFeedback);
  if (loading) return <div className="space-y-2">{[1,2,3].map(i=><Skeleton key={i} className="h-20"/>)}</div>;
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-3">
      {safeArray(feedback).length === 0 ? (
        <EmptyState icon={<MessageSquare className="h-6 w-6" />} title="No feedback yet" />
      ) : safeArray(feedback).map((item, i) => (
        <Card key={String(item.id ?? i)}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                {item.username && <p className="text-xs font-medium">@{item.username}</p>}
                <p className="text-[10px] text-muted-foreground">{formatRelativeTime(item.submitted_at)}</p>
              </div>
              {item.category && <Badge variant="outline" className="text-[10px] capitalize shrink-0">{item.category}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{item.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Runtime Config ───────────────────────────────────────────────────────────
function ConfigTab() {
  const { data: config, loading, error, refetch } = useApi(getRuntimeConfig);
  const [draft, setDraft] = useState<Partial<RuntimeConfig>>({});
  const [saving, setSaving] = useState(false);

  const merged = { ...config, ...draft } as RuntimeConfig;

  const handleSave = async () => {
    if (!Object.keys(draft).length) return;
    hapticImpact('medium');
    setSaving(true);
    try {
      await updateRuntimeConfig(draft);
      hapticNotification('success');
      toast.success('Config saved');
      setDraft({});
      refetch();
    } catch (e) {
      hapticNotification('error');
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton className="h-48" />;
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Runtime Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Trusted Hash Whitelist</Label>
              <p className="text-xs text-muted-foreground">Allow trusted hash approvals globally</p>
            </div>
            <Switch
              checked={!!merged.trusted_hash_whitelist_enabled}
              onCheckedChange={v => setDraft(d => ({ ...d, trusted_hash_whitelist_enabled: v }))}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Max Hash File Size (bytes)</Label>
            <Input
              type="number"
              value={String(merged.max_hash_file_size ?? '')}
              onChange={e => setDraft(d => ({ ...d, max_hash_file_size: Number(e.target.value) }))}
              placeholder="e.g. 10485760"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Max Hashes Per Group</Label>
            <Input
              type="number"
              value={String(merged.max_hashes_per_group ?? '')}
              onChange={e => setDraft(d => ({ ...d, max_hashes_per_group: Number(e.target.value) }))}
              placeholder="e.g. 100"
            />
          </div>

          {/* Additional fields from config */}
          {config && Object.entries(config)
            .filter(([k]) => !['trusted_hash_whitelist_enabled', 'max_hash_file_size', 'max_hashes_per_group'].includes(k))
            .map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-mono text-xs">{key}</span>
                <span className="font-mono text-xs">{JSON.stringify(value)}</span>
              </div>
            ))
          }
        </CardContent>
      </Card>

      {Object.keys(draft).length > 0 && (
        <Button onClick={handleSave} loading={saving} className="w-full gap-2">
          <Save className="h-4 w-4" />
          Save Configuration
        </Button>
      )}
    </div>
  );
}
