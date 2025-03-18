import { logEvent } from './monitoring/logger';

export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      if (registration.installing) {
        logEvent('info', 'Service worker installing');
      } else if (registration.waiting) {
        logEvent('info', 'Service worker installed');
      } else if (registration.active) {
        logEvent('info', 'Service worker active');
      }
    } catch (error) {
      logEvent('error', 'Service worker registration failed', { error });
    }
  }
};

export const unregisterServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      logEvent('info', 'Service worker unregistered');
    }
  }
}; 