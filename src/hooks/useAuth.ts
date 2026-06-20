import { useState, useEffect, useCallback } from 'react';
import { authSession, type UserProfile } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { isInsideTelegram } from '@/lib/telegram';

type AuthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'authenticated'; user: UserProfile }
  | { status: 'error'; message: string }
  | { status: 'no-telegram' };

export function useAuth() {
  const [state, setState] = useState<AuthState>({ status: 'idle' });

  const authenticate = useCallback(async () => {
    if (!isInsideTelegram()) {
      setState({ status: 'no-telegram' });
      return;
    }

    setState({ status: 'loading' });

    try {
      const user = await authSession();
      setState({ status: 'authenticated', user });
    } catch (err) {
      if (err instanceof ApiError) {
        setState({ status: 'error', message: err.message });
      } else {
        setState({ status: 'error', message: 'Failed to connect. Please try again.' });
      }
    }
  }, []);

  useEffect(() => {
    // Small delay to let Telegram SDK initialize
    const timer = setTimeout(authenticate, 300);
    return () => clearTimeout(timer);
  }, [authenticate]);

  const refresh = useCallback(async () => {
    if (state.status === 'authenticated') {
      try {
        const user = await authSession();
        setState({ status: 'authenticated', user });
      } catch {
        // silently fail on refresh
      }
    }
  }, [state.status]);

  return {
    state,
    refresh,
    retry: authenticate,
    user: state.status === 'authenticated' ? state.user : null,
    isLoading: state.status === 'loading' || state.status === 'idle',
    isAuthenticated: state.status === 'authenticated',
    isError: state.status === 'error',
    isNoTelegram: state.status === 'no-telegram',
  };
}
