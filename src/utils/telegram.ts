/**
 * Telegram WebApp utilities
 */

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
      language_code?: string;
    };
    start_param?: string;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  onEvent: (eventType: string, callback: (event: unknown) => void) => void;
  offEvent: (eventType: string, callback: (event: unknown) => void) => void;
}

export interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
}

/**
 * Check if running inside Telegram WebApp
 */
export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;
}

/**
 * Get Telegram WebApp instance
 */
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp ?? null;
}

/**
 * Get current Telegram user from initData
 */
export function getTelegramUser(): TelegramUser | null {
  const webapp = getTelegramWebApp();
  if (!webapp) return null;

  const user = webapp.initDataUnsafe?.user;
  if (!user) return null;

  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    photoUrl: user.photo_url,
  };
}

/**
 * Initialize Telegram WebApp
 */
export function initTelegramWebApp(): void {
  const webapp = getTelegramWebApp();
  if (webapp) {
    webapp.ready();
    webapp.expand();
  }
}

/**
 * Get local test user for development
 */
export function getLocalTestUser(): TelegramUser {
  return {
    id: 99999,
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    photoUrl: undefined,
  };
}

/**
 * Get user - from Telegram or local test
 */
export function getCurrentUser(): TelegramUser {
  const tgUser = getTelegramUser();
  if (tgUser) return tgUser;

  // Fallback to local test user for development
  console.log('[Telegram] Not in Telegram WebApp, using local test user (tgId=99999)');
  return getLocalTestUser();
}

/**
 * Open Telegram Stars invoice for payment
 */
export function openStarsInvoice(
  invoiceUrl: string,
  onSuccess: (paymentId: string) => void,
  onFailed: () => void
): void {
  const webapp = getTelegramWebApp();
  
  if (!webapp) {
    // For local testing, simulate successful payment
    console.log('[Telegram] Simulating Stars payment (local mode)');
    setTimeout(() => {
      onSuccess('local_payment_' + Date.now());
    }, 1000);
    return;
  }

  webapp.openInvoice(invoiceUrl, (status) => {
    if (status === 'paid') {
      // In real scenario, Telegram returns payment info
      onSuccess('tg_payment_' + Date.now());
    } else {
      onFailed();
    }
  });
}
