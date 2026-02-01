// src/telegram.ts
import {
    init,
    viewport,
    swipeBehavior,
    isTMA,
  } from '@telegram-apps/sdk-react';
  
  export async function initTelegram() {
    const tg = window.Telegram?.WebApp;
  
    // Инициализация через WebApp API (работает всегда)
    if (tg) {
      tg.ready();
      tg.expand();
  
      // Повтор при изменении viewport
      tg.onEvent('viewportChanged', () => {
        tg.expand();
      });
  
      // Повтор при возврате в фокус
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          tg.expand();
        }
      });
    }
  
    // SDK инициализация (дополнительно)
    if (!(await isTMA())) return;
  
    init();
  
    // viewport через SDK
    if (viewport.mount.isAvailable()) {
      await viewport.mount();
      viewport.expand();
    }
  
    // fullscreen (Android + Desktop)
    if (viewport.requestFullscreen.isAvailable()) {
      viewport.requestFullscreen();
    }
  
    // запрет свайпа вниз
    if (swipeBehavior.isSupported()) {
      swipeBehavior.mount();
      swipeBehavior.disableVertical();
    }
  }