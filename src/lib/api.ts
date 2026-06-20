import { getInitData } from './telegram';

export const API_BASE = import.meta.env.VITE_API_BASE || 'https://exe-file-remover.onrender.com';

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface UserProfile {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  is_developer?: boolean;
  is_owner?: boolean;
  linked_groups?: number;
  protected_groups?: number;
  open_incidents?: number;
  risk_count?: number;
}

export interface Group {
  chat_id: number | string;
  title: string;
  type?: string;
  protection_enabled?: boolean;
  strictness?: 'standard' | 'high';
  silent_mode?: boolean;
  bot_is_admin?: boolean;
  member_count?: number;
  username?: string;
}

export interface GroupSettings {
  chat_id: number | string;
  title?: string;
  protection_enabled: boolean;
  strictness: 'standard' | 'high';
  silent_mode: boolean;
  auto_action?: string;
  scanner_enabled?: boolean;
}

export interface ScanResult {
  safe: boolean;
  blocked: boolean;
  reason?: string;
  matched_extension?: string;
  filename?: string;
  risk_level?: string;
}

export interface Incident {
  id?: string | number;
  token?: string;
  key?: string;
  filename?: string;
  sender?: string;
  sender_id?: number;
  reason?: string;
  time?: string;
  created_at?: string;
  status?: string;
  action_taken?: string;
  group_id?: number | string;
}

export interface RiskMember {
  user_id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  incident_count?: number;
  last_incident?: string;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
}

export interface Admin {
  user_id: number;
  name?: string;
  first_name?: string;
  username?: string;
  alert_ready?: boolean;
  needs_private_start?: boolean;
  permissions?: Record<string, boolean>;
  can_delete_messages?: boolean;
  can_restrict_members?: boolean;
  is_bot?: boolean;
}

export interface HealthCheck {
  bot_is_admin?: boolean;
  can_delete_messages?: boolean;
  can_restrict_members?: boolean;
  protection_enabled?: boolean;
  scanner_enabled?: boolean;
  admin_alerts_ready?: boolean;
  overall?: 'healthy' | 'degraded' | 'critical';
  checks?: Array<{ name: string; status: boolean; message?: string }>;
}

export interface TrustedHash {
  digest: string;
  label?: string;
  note?: string;
  added_at?: string;
  added_by?: number;
}

export interface Format {
  extension: string;
  added_at?: string;
}

export interface DevOverview {
  total_users?: number;
  total_groups?: number;
  total_incidents?: number;
  active_users_24h?: number;
  protected_groups?: number;
  bot_version?: string;
  uptime?: string;
}

export interface DevUser {
  telegram_id: number;
  first_name?: string;
  username?: string;
  is_premium?: boolean;
  joined_at?: string;
  group_count?: number;
}

export interface DevGroup {
  chat_id: number | string;
  title?: string;
  member_count?: number;
  protection_enabled?: boolean;
  incident_count?: number;
  joined_at?: string;
}

export interface FeedbackItem {
  id?: string | number;
  category?: string;
  message?: string;
  user_id?: number;
  username?: string;
  submitted_at?: string;
}

export interface RuntimeConfig {
  trusted_hash_whitelist_enabled?: boolean;
  max_hash_file_size?: number;
  max_hashes_per_group?: number;
  [key: string]: unknown;
}

// ─── API Errors ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const initData = getInitData();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (initData) {
    headers['Authorization'] = `tma ${initData}`;
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorData: unknown;
    try {
      errorData = await res.json();
    } catch {
      errorData = null;
    }

    if (res.status === 401) {
      throw new ApiError(401, 'Session expired. Please reopen from Telegram.', errorData);
    }
    if (res.status === 403) {
      throw new ApiError(403, 'You do not have permission to perform this action.', errorData);
    }
    if (res.status === 404) {
      throw new ApiError(404, 'Resource not found.', errorData);
    }

    const msg = (errorData as { detail?: string; message?: string })?.detail
      ?? (errorData as { detail?: string; message?: string })?.message
      ?? `Request failed with status ${res.status}`;

    throw new ApiError(res.status, msg, errorData);
  }

  if (res.status === 204) return {} as T;

  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authSession = () =>
  apiFetch<UserProfile>('/api/auth/session', { method: 'POST' });

// ─── User ─────────────────────────────────────────────────────────────────────

export const getMe = () => apiFetch<UserProfile>('/api/me');

export const getMyGroups = () => apiFetch<Group[]>('/api/me/groups');

// ─── Groups ───────────────────────────────────────────────────────────────────

export const getGroup = (chatId: string | number) =>
  apiFetch<GroupSettings>(`/api/groups/${chatId}`);

export const updateGroupSettings = (chatId: string | number, settings: Partial<GroupSettings>) =>
  apiFetch<GroupSettings>(`/api/groups/${chatId}/settings`, {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });

// ─── Scanner ──────────────────────────────────────────────────────────────────

export const scanFilename = (filename: string) =>
  apiFetch<ScanResult>('/api/scan/name', {
    method: 'POST',
    body: JSON.stringify({ filename }),
  });

// ─── Formats ─────────────────────────────────────────────────────────────────

export const getAllowedFormats = (chatId: string | number) =>
  apiFetch<Format[]>(`/api/groups/${chatId}/formats/allowed`);

export const addAllowedFormat = (chatId: string | number, ext: string) =>
  apiFetch<Format>(`/api/groups/${chatId}/formats/allowed`, {
    method: 'POST',
    body: JSON.stringify({ extension: ext }),
  });

export const deleteAllowedFormat = (chatId: string | number, ext: string) =>
  apiFetch<void>(`/api/groups/${chatId}/formats/allowed/${encodeURIComponent(ext)}`, {
    method: 'DELETE',
  });

export const getBlockedFormats = (chatId: string | number) =>
  apiFetch<Format[]>(`/api/groups/${chatId}/formats/blocked`);

export const addBlockedFormat = (chatId: string | number, ext: string) =>
  apiFetch<Format>(`/api/groups/${chatId}/formats/blocked`, {
    method: 'POST',
    body: JSON.stringify({ extension: ext }),
  });

export const deleteBlockedFormat = (chatId: string | number, ext: string) =>
  apiFetch<void>(`/api/groups/${chatId}/formats/blocked/${encodeURIComponent(ext)}`, {
    method: 'DELETE',
  });

// ─── Trusted Hashes ───────────────────────────────────────────────────────────

export const getTrustedHashes = (chatId: string | number) =>
  apiFetch<TrustedHash[]>(`/api/groups/${chatId}/trusted-hashes`);

export const addTrustedHash = (chatId: string | number, digest: string, label?: string) =>
  apiFetch<TrustedHash>(`/api/groups/${chatId}/trusted-hashes`, {
    method: 'POST',
    body: JSON.stringify({ digest, label }),
  });

export const deleteTrustedHash = (chatId: string | number, digest: string) =>
  apiFetch<void>(`/api/groups/${chatId}/trusted-hashes/${encodeURIComponent(digest)}`, {
    method: 'DELETE',
  });

// ─── Incidents ────────────────────────────────────────────────────────────────

export const getIncidents = (chatId: string | number) =>
  apiFetch<Incident[]>(`/api/groups/${chatId}/incidents`);

export const takeIncidentAction = (tokenOrKey: string, action: string) =>
  apiFetch<void>(`/api/incidents/${tokenOrKey}/action`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });

// ─── Risk ─────────────────────────────────────────────────────────────────────

export const getRisk = (chatId: string | number) =>
  apiFetch<RiskMember[]>(`/api/groups/${chatId}/risk`);

// ─── Admins ───────────────────────────────────────────────────────────────────

export const getAdmins = (chatId: string | number) =>
  apiFetch<Admin[]>(`/api/groups/${chatId}/admins`);

// ─── Health ───────────────────────────────────────────────────────────────────

export const getHealth = (chatId: string | number) =>
  apiFetch<HealthCheck>(`/api/groups/${chatId}/health`);

// ─── Logs ─────────────────────────────────────────────────────────────────────

export const getLogs = (chatId: string | number) =>
  apiFetch<unknown[]>(`/api/groups/${chatId}/logs`);

// ─── Feedback ─────────────────────────────────────────────────────────────────

export const submitFeedback = (category: string, message: string) =>
  apiFetch<void>('/api/feedback', {
    method: 'POST',
    body: JSON.stringify({ category, message }),
  });

// ─── Developer ────────────────────────────────────────────────────────────────

export const getDevOverview = () => apiFetch<DevOverview>('/api/developer/overview');
export const getDevUsers = () => apiFetch<DevUser[]>('/api/developer/users');
export const getDevGroups = () => apiFetch<DevGroup[]>('/api/developer/groups');
export const getDevFeedback = () => apiFetch<FeedbackItem[]>('/api/developer/feedback');
export const getRuntimeConfig = () => apiFetch<RuntimeConfig>('/api/developer/runtime-config');
export const updateRuntimeConfig = (config: Partial<RuntimeConfig>) =>
  apiFetch<RuntimeConfig>('/api/developer/runtime-config', {
    method: 'PATCH',
    body: JSON.stringify(config),
  });
