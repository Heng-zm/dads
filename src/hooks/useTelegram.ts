import { useEffect, useState } from 'react';
import {
  tg,
  getTelegramUser,
  isInsideTelegram,
  applyTelegramTheme,
  initTelegramApp,
  type TelegramUser,
} from '@/lib/telegram';

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    initTelegramApp();
    applyTelegramTheme();

    const app = tg();
    if (app) {
      setUser(getTelegramUser());
      setIsDark(app.colorScheme === 'dark');
    }

    setIsReady(true);

    // Listen for theme changes
    const handleThemeChange = () => {
      applyTelegramTheme();
      setIsDark(tg()?.colorScheme === 'dark');
    };

    // Telegram doesn't have a native event for theme changes,
    // but we can listen to window events if the platform fires them
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  return {
    user,
    isReady,
    isDark,
    isInsideTelegram: isInsideTelegram(),
    tgApp: tg(),
  };
}
