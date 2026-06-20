import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Settings, Shield, FileText, Hash, AlertTriangle,
  UserX, Users, Activity, FileCode, Save, RefreshCw, Plus, Trash2, X
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch, Label, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Alert, AlertDescription } from '@/components/ui/form-elements';
import { HealthDot, EmptyState, StatCard } from '@/components/common';
import { AppShell } from '@/components/layout/AppShell';
import { useApi, useMutation } from '@/hooks/useApi';
import {
  getGroup, updateGroupSettings, getAllowedFormats, getBlockedFormats,
  addAllowedFormat, deleteAllowedFormat, addBlockedFormat, deleteBlockedFormat,
  getTrustedHashes, addTrustedHash, deleteTrustedHash,
  getIncidents, takeIncidentAction, getRisk, getAdmins, getHealth, getLogs,
  type GroupSettings,
} from '@/lib/api';
import { hapticImpact, hapticNotification } from '@/lib/telegram';
import { formatRelativeTime, validateExtension, validateHash, safeArray, getUserDisplayName, getRiskColor } from '@/lib/utils';

export function GroupDetail() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  if (!chatId) {
    navigate('/groups');
    return null;
  }

  return (
    <AppShell
      noHeader
      className=""
    >
      {/* Custom header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <Button variant="ghost" size="icon" onClick={() => { hapticImpact(); navigate('/groups'); }}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">Group Admin Panel</p>
            <p className="text-xs text-muted-foreground font-mono truncate">{chatId}</p>
          </div>
          <Shield className="h-5 w-5 text-primary shrink-0" />
        </div>
      </div>

      <div className="p-4">
        {/* Scrollable tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { hapticImpact('light'); setActiveTab(v); }}>
          <div className="overflow-x-auto -mx-4 px-4 pb-1">
            <TabsList className="flex w-max gap-1 bg-muted/50 p-1">
              {[
                { value: 'overview', icon: Settings, label: 'Overview' },
                { value: 'scanner', icon: Shield, label: 'Scanner' },
                { value: 'formats', icon: FileText, label: 'Formats' },
                { value: 'hashes', icon: Hash, label: 'Hashes' },
                { value: 'incidents', icon: AlertTriangle, label: 'Incidents' },
                { value: 'risk', icon: UserX, label: 'Risk' },
                { value: 'admins', icon: Users, label: 'Admins' },
                { value: 'health', icon: Activity, label: 'Health' },
                { value: 'logs', icon: FileCode, label: 'Logs' },
              ].map(({ value, icon: Icon, label }) => (
                <TabsTrigger key={value} value={value} className="gap-1.5 whitespace-nowrap text-xs px-3">
                  <Icon className="h-3 w-3" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-4">
            <TabsContent value="overview">
              <OverviewTab chatId={chatId} />
            </TabsContent>
            <TabsContent value="scanner">
              <ScannerTab chatId={chatId} />
            </TabsContent>
            <TabsContent value="formats">
              <FormatsTab chatId={chatId} />
            </TabsContent>
            <TabsContent value="hashes">
              <HashesTab chatId={chatId} />
            </TabsContent>
            <TabsContent value="incidents">
              <IncidentsTab chatId={chatId} />
            </TabsContent>
            <TabsContent value="risk">
              <RiskTab chatId={chatId} />
            </TabsContent>
            <TabsContent value="admins">
              <AdminsTab chatId={chatId} />
            </TabsContent>
            <TabsContent value="health">
              <HealthTab chatId={chatId} />
            </TabsContent>
            <TabsContent value="logs">
              <LogsTab chatId={chatId} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppShell>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ chatId }: { chatId: string }) {
  const { data: group, loading, error } = useApi(() => getGroup(chatId));
  const [settings, setSettings] = useState<Partial<GroupSettings>>({});
  const [saving, setSaving] = useState(false);

  const merged = { ...group, ...settings } as GroupSettings;

  const handleSave = async () => {
    if (!Object.keys(settings).length) return;
    hapticImpact('medium');
    setSaving(true);
    try {
      await updateGroupSettings(chatId, settings);
      hapticNotification('success');
      toast.success('Settings saved');
      setSettings({});
    } catch (err) {
      hapticNotification('error');
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>;
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Protection Settings</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Protection Enabled</Label>
              <p className="text-xs text-muted-foreground">Block EXE files in this group</p>
            </div>
            <Switch
              checked={merged.protection_enabled ?? false}
              onCheckedChange={(v) => setSettings(s => ({ ...s, protection_enabled: v }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Silent Mode</Label>
              <p className="text-xs text-muted-foreground">Remove files without notification</p>
            </div>
            <Switch
              checked={merged.silent_mode ?? false}
              onCheckedChange={(v) => setSettings(s => ({ ...s, silent_mode: v }))}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Strictness Level</Label>
            <Select
              value={merged.strictness ?? 'standard'}
              onValueChange={(v: 'standard' | 'high') => setSettings(s => ({ ...s, strictness: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select strictness" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard — Block known executables</SelectItem>
                <SelectItem value="high">High — Block all suspicious files</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {merged.auto_action !== undefined && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Auto Action</Label>
              <Select
                value={merged.auto_action ?? 'delete'}
                onValueChange={(v) => setSettings(s => ({ ...s, auto_action: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delete">Delete only</SelectItem>
                  <SelectItem value="warn">Delete + Warn user</SelectItem>
                  <SelectItem value="ban">Delete + Ban user</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {Object.keys(settings).length > 0 && (
        <Button onClick={handleSave} loading={saving} className="w-full gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      )}
    </div>
  );
}

// ─── Scanner Tab ──────────────────────────────────────────────────────────────
function ScannerTab({ chatId }: { chatId: string }) {
  const { data: group, loading } = useApi(() => getGroup(chatId));
  if (loading) return <Skeleton className="h-32" />;

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Scanner Active</span>
            <Badge variant={group?.protection_enabled ? 'safe' : 'danger'}>
              {group?.protection_enabled ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Strictness</span>
            <Badge variant="outline">{group?.strictness ?? 'standard'}</Badge>
          </div>
        </CardContent>
      </Card>
      <Alert variant="info">
        <AlertDescription className="text-xs">
          The scanner checks all file names against known executable extensions and custom blocked formats.
          Use the Formats tab to manage custom extensions.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// ─── Formats Tab ──────────────────────────────────────────────────────────────
function FormatsTab({ chatId }: { chatId: string }) {
  const [newAllowed, setNewAllowed] = useState('');
  const [newBlocked, setNewBlocked] = useState('');

  const { data: allowed, loading: la, refetch: ra } = useApi(() => getAllowedFormats(chatId));
  const { data: blocked, loading: lb, refetch: rb } = useApi(() => getBlockedFormats(chatId));

  const addAllowed = async () => {
    if (!validateExtension(newAllowed)) { toast.error('Extension must start with a dot, e.g. .pdf'); return; }
    hapticImpact();
    try {
      await addAllowedFormat(chatId, newAllowed);
      toast.success(`Added ${newAllowed} to allowed`);
      setNewAllowed('');
      ra();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const addBlocked = async () => {
    if (!validateExtension(newBlocked)) { toast.error('Extension must start with a dot, e.g. .exe'); return; }
    hapticImpact();
    try {
      await addBlockedFormat(chatId, newBlocked);
      toast.success(`Added ${newBlocked} to blocked`);
      setNewBlocked('');
      rb();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const removeAllowed = async (ext: string) => {
    hapticImpact('medium');
    try { await deleteAllowedFormat(chatId, ext); ra(); toast.success('Removed'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const removeBlocked = async (ext: string) => {
    hapticImpact('medium');
    try { await deleteBlockedFormat(chatId, ext); rb(); toast.success('Removed'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <FormatSection
        title="Allowed Formats"
        description="These file types are always permitted"
        items={safeArray(allowed)}
        loading={la}
        newValue={newAllowed}
        onNewValueChange={setNewAllowed}
        onAdd={addAllowed}
        onRemove={removeAllowed}
        badgeVariant="safe"
        placeholder=".pdf"
      />
      <FormatSection
        title="Blocked Formats"
        description="These file types are always removed"
        items={safeArray(blocked)}
        loading={lb}
        newValue={newBlocked}
        onNewValueChange={setNewBlocked}
        onAdd={addBlocked}
        onRemove={removeBlocked}
        badgeVariant="danger"
        placeholder=".exe"
      />
    </div>
  );
}

function FormatSection({
  title, description, items, loading, newValue, onNewValueChange, onAdd, onRemove, badgeVariant, placeholder
}: {
  title: string; description: string; items: { extension: string }[];
  loading: boolean; newValue: string; onNewValueChange: (v: string) => void;
  onAdd: () => void; onRemove: (ext: string) => void;
  badgeVariant: 'safe' | 'danger'; placeholder: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? <Skeleton className="h-8 w-full" /> : (
          <div className="flex flex-wrap gap-2 min-h-8">
            {items.length === 0 ? (
              <p className="text-xs text-muted-foreground">No formats added</p>
            ) : items.map(f => (
              <Badge key={f.extension} variant={badgeVariant} className="gap-1 pr-1 text-xs">
                {f.extension}
                <button onClick={() => onRemove(f.extension)} className="ml-0.5 hover:opacity-70">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={newValue}
            onChange={e => onNewValueChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 font-mono text-sm h-9"
            onKeyDown={e => e.key === 'Enter' && onAdd()}
          />
          <Button size="sm" onClick={onAdd} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Hashes Tab ───────────────────────────────────────────────────────────────
function HashesTab({ chatId }: { chatId: string }) {
  const { data: hashes, loading, refetch } = useApi(() => getTrustedHashes(chatId));
  const [newDigest, setNewDigest] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const handleAdd = async () => {
    if (!validateHash(newDigest)) { toast.error('Enter a valid SHA-256 (64 chars) or MD5 (32 chars) hash'); return; }
    hapticImpact();
    try {
      await addTrustedHash(chatId, newDigest, newLabel || undefined);
      toast.success('Hash added');
      setNewDigest(''); setNewLabel('');
      refetch();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const handleDelete = async (digest: string) => {
    hapticImpact('medium');
    try { await deleteTrustedHash(chatId, digest); refetch(); toast.success('Hash removed'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <Alert variant="warning">
        <AlertDescription className="text-xs">
          Trusted hashes allow specific files (by exact hash) through the scanner.
          Only add hashes for files you have verified yourself.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader><CardTitle className="text-sm">Add Trusted Hash</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">SHA-256 or MD5 Hash</Label>
            <Input value={newDigest} onChange={e => setNewDigest(e.target.value)} placeholder="e.g. a1b2c3d4..." className="font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Label / Note (optional)</Label>
            <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g. Company VPN installer" />
          </div>
          <Button onClick={handleAdd} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Hash
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Trusted Hashes ({safeArray(hashes).length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-20" /> : safeArray(hashes).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No trusted hashes added</p>
          ) : (
            <div className="space-y-3">
              {safeArray(hashes).map(h => (
                <div key={h.digest} className="flex items-start gap-2 rounded-lg bg-muted/40 p-3">
                  <Hash className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    {h.label && <p className="text-xs font-medium">{h.label}</p>}
                    <p className="text-[10px] font-mono text-muted-foreground break-all">{h.digest}</p>
                    {h.added_at && <p className="text-[10px] text-muted-foreground">{formatRelativeTime(h.added_at)}</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-red-500" onClick={() => handleDelete(h.digest)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Incidents Tab ────────────────────────────────────────────────────────────
function IncidentsTab({ chatId }: { chatId: string }) {
  const { data: incidents, loading, refetch } = useApi(() => getIncidents(chatId));

  const handleAction = async (tokenOrKey: string, action: string) => {
    hapticImpact('medium');
    try {
      await takeIncidentAction(tokenOrKey, action);
      hapticNotification('success');
      toast.success(`Action "${action}" applied`);
      refetch();
    } catch (e) { hapticNotification('error'); toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  if (loading) return <div className="space-y-3">{[1,2].map(i=><Skeleton key={i} className="h-28"/>)}</div>;

  return (
    <div className="space-y-3">
      {safeArray(incidents).length === 0 ? (
        <EmptyState icon={<AlertTriangle className="h-6 w-6" />} title="No incidents" description="No file incidents recorded for this group." />
      ) : safeArray(incidents).map((inc, i) => {
        const key = String(inc.token ?? inc.key ?? inc.id ?? i);
        return (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{inc.filename ?? 'Unknown file'}</p>
                  <p className="text-xs text-muted-foreground">{inc.reason ?? '—'}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                    {inc.sender && <span>By: {inc.sender}</span>}
                    <span>{formatRelativeTime(inc.time ?? inc.created_at)}</span>
                  </div>
                </div>
                <Badge variant={inc.status === 'resolved' ? 'safe' : 'warning'} className="shrink-0">
                  {inc.status ?? 'open'}
                </Badge>
              </div>
              {!inc.action_taken && (
                <div className="flex gap-2">
                  {['ban', 'warn', 'ignore'].map(action => (
                    <Button key={action} size="xs"
                      variant={action === 'ban' ? 'danger' : action === 'warn' ? 'warning' : 'outline'}
                      onClick={() => handleAction(key, action)}
                      className="capitalize flex-1"
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              )}
              {inc.action_taken && (
                <p className="text-xs text-muted-foreground">Action taken: <span className="font-medium">{inc.action_taken}</span></p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Risk Tab ─────────────────────────────────────────────────────────────────
function RiskTab({ chatId }: { chatId: string }) {
  const { data: risk, loading } = useApi(() => getRisk(chatId));
  if (loading) return <Skeleton className="h-40" />;

  return (
    <div className="space-y-3">
      {safeArray(risk).length === 0 ? (
        <EmptyState icon={<UserX className="h-6 w-6" />} title="No risky members" description="No flagged users in this group." />
      ) : safeArray(risk).map((member) => (
        <Card key={member.user_id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{getUserDisplayName(member)}</p>
                <p className="text-xs text-muted-foreground font-mono">ID: {member.user_id}</p>
                {member.last_incident && (
                  <p className="text-xs text-muted-foreground">Last: {formatRelativeTime(member.last_incident)}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge className={`text-xs ${getRiskColor(member.risk_level)}`}>
                  {member.risk_level ?? 'unknown'}
                </Badge>
                <p className="text-xs font-medium">{member.incident_count ?? 0} incidents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Admins Tab ───────────────────────────────────────────────────────────────
function AdminsTab({ chatId }: { chatId: string }) {
  const { data: admins, loading } = useApi(() => getAdmins(chatId));
  if (loading) return <Skeleton className="h-40" />;

  return (
    <div className="space-y-3">
      {safeArray(admins).length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title="No admins found" />
      ) : safeArray(admins).map((admin) => (
        <Card key={admin.user_id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {getUserDisplayName(admin).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-medium">{getUserDisplayName(admin)}</p>
                  {admin.is_bot && <Badge variant="info" className="text-[10px] py-0">Bot</Badge>}
                </div>
                <p className="text-xs text-muted-foreground font-mono">ID: {admin.user_id}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge variant={admin.alert_ready ? 'safe' : 'warning'} className="text-[10px]">
                  {admin.alert_ready ? 'Alert Ready' : 'No Alerts'}
                </Badge>
                {admin.needs_private_start && (
                  <span className="text-[10px] text-yellow-600 dark:text-yellow-400">Needs /start</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Health Tab ───────────────────────────────────────────────────────────────
function HealthTab({ chatId }: { chatId: string }) {
  const { data: health, loading, refetch } = useApi(() => getHealth(chatId));

  const defaultChecks = [
    { name: 'Bot is admin', key: 'bot_is_admin' },
    { name: 'Can delete messages', key: 'can_delete_messages' },
    { name: 'Can restrict members', key: 'can_restrict_members' },
    { name: 'Protection enabled', key: 'protection_enabled' },
    { name: 'Scanner enabled', key: 'scanner_enabled' },
    { name: 'Admin alerts ready', key: 'admin_alerts_ready' },
  ];

  if (loading) return <Skeleton className="h-52" />;

  const checks = health?.checks ?? defaultChecks.map(c => ({
    name: c.name,
    status: (health as Record<string, unknown>)?.[c.key] as boolean | undefined,
  }));

  const allGood = checks.every(c => c.status !== false);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">System Health</p>
              <p className="text-xs text-muted-foreground">
                {allGood ? 'All systems operational' : 'Some checks failed'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${allGood ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
              <span className="text-xs font-medium">{allGood ? 'Healthy' : 'Degraded'}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => { hapticImpact(); refetch(); }}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
            <HealthDot ok={check.status} />
            <span className="text-sm flex-1">{check.name}</span>
            <span className={`text-xs font-medium ${check.status ? 'text-green-600 dark:text-green-400' : check.status === false ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
              {check.status === true ? 'OK' : check.status === false ? 'Failed' : 'Unknown'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Logs Tab ─────────────────────────────────────────────────────────────────
function LogsTab({ chatId }: { chatId: string }) {
  const { data: logs, loading } = useApi(() => getLogs(chatId));
  if (loading) return <Skeleton className="h-40" />;

  return (
    <div>
      {safeArray(logs).length === 0 ? (
        <EmptyState icon={<FileCode className="h-6 w-6" />} title="No logs available" />
      ) : (
        <div className="space-y-2">
          {safeArray(logs).map((log, i) => (
            <div key={i} className="rounded-lg bg-muted/50 p-3">
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
                {typeof log === 'string' ? log : JSON.stringify(log, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
