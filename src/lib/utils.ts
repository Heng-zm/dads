import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) return formatDate(dateStr);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  } catch {
    return dateStr;
  }
}

export function truncate(str?: string, max = 40): string {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 3) + '…' : str;
}

export function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.[0] ?? '';
  const l = lastName?.[0] ?? '';
  return (f + l).toUpperCase() || '?';
}

export function validateExtension(ext: string): boolean {
  return /^\.[a-zA-Z0-9]+$/.test(ext);
}

export function validateHash(hash: string): boolean {
  // SHA-256 (64 hex) or MD5 (32 hex)
  return /^[a-fA-F0-9]{32}$/.test(hash) || /^[a-fA-F0-9]{64}$/.test(hash);
}

export function getRiskColor(level?: string): string {
  switch (level?.toLowerCase()) {
    case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
    case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
    case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
    default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
  }
}

export function formatChatId(chatId: number | string): string {
  const s = String(chatId);
  return s.startsWith('-100') ? s : s;
}

export function safeArray<T>(val: T[] | null | undefined): T[] {
  return Array.isArray(val) ? val : [];
}

export function getUserDisplayName(user: {
  first_name?: string;
  last_name?: string;
  name?: string;
  username?: string;
}): string {
  if (user.name) return user.name;
  const parts = [user.first_name, user.last_name].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  if (user.username) return `@${user.username}`;
  return 'Unknown';
}
