import { useState, useEffect, useRef, useCallback } from 'react';

const DISMISS_STORAGE_KEY = 'spqs_install_dismissed_at';
const COOLDOWN_PERIOD_MS = 604_800_000; // 7 days

/**
 * Detects if the current browser is Safari on an iOS device.
 * Checks for iPhone/iPad/iPod in user agent and absence of Chrome/CriOS/FxiOS.
 *
 * @returns {boolean}
 */
function detectIOSSafari() {
  const ua = window.navigator.userAgent;
  const isIOS = /iP(hone|ad|od)/i.test(ua);
  const isWebkit = /WebKit/i.test(ua);
  const isNotChrome = !/CriOS/i.test(ua);
  const isNotFirefox = !/FxiOS/i.test(ua);
  return isIOS && isWebkit && isNotChrome && isNotFirefox;
}

/**
 * Checks whether the dismissal cooldown period has expired.
 *
 * @returns {boolean} True if cooldown has expired (or was never set), false if still within cooldown.
 */
function isCooldownExpired() {
  try {
    const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!dismissedAt) return true;

    const elapsed = Date.now() - parseInt(dismissedAt, 10);
    return elapsed >= COOLDOWN_PERIOD_MS;
  } catch {
    // localStorage access can throw in private/restricted contexts
    return true;
  }
}

/**
 * Custom hook that captures the `beforeinstallprompt` event for PWA installation.
 *
 * Features:
 * - Captures and stores the native `beforeinstallprompt` event
 * - Tracks installation state via `appinstalled` event and `display-mode: standalone` media query
 * - Implements a 7-day dismissal cooldown stored in localStorage
 * - Detects iOS Safari for showing manual install instructions
 *
 * @returns {{
 *   canShowPrompt: boolean,
 *   promptInstall: () => Promise<void>,
 *   dismissPrompt: () => void,
 *   isInstalled: boolean,
 *   isIOSSafari: boolean
 * }}
 */
export default function useInstallPrompt() {
  const deferredPromptRef = useRef(null);
  const [promptCaptured, setPromptCaptured] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    // Check if already running in standalone mode
    return window.matchMedia('(display-mode: standalone)').matches;
  });
  const [cooldownActive, setCooldownActive] = useState(() => !isCooldownExpired());
  const [isIOSSafari] = useState(() => detectIOSSafari());

  useEffect(() => {
    /**
     * Handles the `beforeinstallprompt` event fired by the browser.
     * Prevents default behavior and stores the event for later use.
     *
     * @param {BeforeInstallPromptEvent} event
     */
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      deferredPromptRef.current = event;
      setPromptCaptured(true);
    };

    /**
     * Handles the `appinstalled` event fired after successful PWA installation.
     */
    const handleAppInstalled = () => {
      setIsInstalled(true);
      deferredPromptRef.current = null;
      setPromptCaptured(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Listen for display-mode changes (e.g., user installs via browser menu)
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (/** @type {MediaQueryListEvent} */ e) => {
      if (e.matches) {
        setIsInstalled(true);
      }
    };
    standaloneQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      standaloneQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  /**
   * Triggers the native browser install prompt.
   * On user dismissal, activates the 7-day cooldown.
   * On acceptance, no special action is taken (appinstalled event handles it).
   */
  const promptInstall = useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;

      if (outcome === 'dismissed') {
        // User dismissed — activate cooldown
        try {
          localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
        } catch {
          // Silently handle localStorage write failures
        }
        setCooldownActive(true);
      }
    } catch {
      // Prompt may fail if already shown or in unsupported context
    } finally {
      deferredPromptRef.current = null;
      setPromptCaptured(false);
    }
  }, []);

  /**
   * Manually dismisses the install prompt and activates the 7-day cooldown.
   * Use when the user explicitly closes a custom install banner/UI.
   */
  const dismissPrompt = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    } catch {
      // Silently handle localStorage write failures
    }
    setCooldownActive(true);
    deferredPromptRef.current = null;
    setPromptCaptured(false);
  }, []);

  // canShowPrompt: event captured AND not already installed AND cooldown expired
  const canShowPrompt = promptCaptured && !isInstalled && !cooldownActive;

  return {
    canShowPrompt,
    promptInstall,
    dismissPrompt,
    isInstalled,
    isIOSSafari,
  };
}
