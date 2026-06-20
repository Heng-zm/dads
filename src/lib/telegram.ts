// Telegram WebApp type definitions
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  allows_write_to_pm?: boolean;
}

export interface TelegramTheme {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    chat_type?: string;
    chat_instance?: string;
    start_param?: string;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramTheme;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (fn: () => void) => void;
    offClick: (fn: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (fn: () => void) => void;
    offClick: (fn: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{ id: string; type?: string; text?: string }>;
  }, callback?: (buttonId: string) => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Telegram helpers
export const tg = (): TelegramWebApp | null => {
  return window.Telegram?.WebApp ?? null;
};

export const getTelegramUser = (): TelegramUser | null => {
  return tg()?.initDataUnsafe?.user ?? null;
};

export const getInitData = (): string => {
  return tg()?.initData ?? '';
};

export const isInsideTelegram = (): boolean => {
  const app = tg();
  return !!app && !!app.initData && app.initData.length > 0;
};

export const hapticImpact = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  tg()?.HapticFeedback?.impactOccurred(style);
};

export const hapticNotification = (type: 'error' | 'success' | 'warning') => {
  tg()?.HapticFeedback?.notificationOccurred(type);
};

export const hapticSelection = () => {
  tg()?.HapticFeedback?.selectionChanged();
};

export const initTelegramApp = () => {
  const app = tg();
  if (app) {
    app.ready();
    app.expand();
  }
};

export const applyTelegramTheme = () => {
  const app = tg();
  if (!app) return;

  const theme = app.themeParams;
  const root = document.documentElement;

  if (app.colorScheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Apply Telegram theme colors as CSS variables
  if (theme.bg_color) root.style.setProperty('--tg-bg', theme.bg_color);
  if (theme.text_color) root.style.setProperty('--tg-text', theme.text_color);
  if (theme.button_color) root.style.setProperty('--tg-button', theme.button_color);
  if (theme.button_text_color) root.style.setProperty('--tg-button-text', theme.button_text_color);
  if (theme.hint_color) root.style.setProperty('--tg-hint', theme.hint_color);
  if (theme.link_color) root.style.setProperty('--tg-link', theme.link_color);
  if (theme.secondary_bg_color) root.style.setProperty('--tg-secondary-bg', theme.secondary_bg_color);
};

export const showMainButton = (text: string, onClick: () => void) => {
  const app = tg();
  if (!app) return;
  app.MainButton.setText(text);
  app.MainButton.onClick(onClick);
  app.MainButton.show();
};

export const hideMainButton = () => {
  tg()?.MainButton.hide();
};

export const showBackButton = (onClick: () => void) => {
  const app = tg();
  if (!app) return;
  app.BackButton.onClick(onClick);
  app.BackButton.show();
};

export const hideBackButton = () => {
  tg()?.BackButton.hide();
};
