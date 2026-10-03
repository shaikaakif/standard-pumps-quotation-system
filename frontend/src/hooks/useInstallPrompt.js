import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Detect iOS device (iPhone / iPad / iPod)
 */
function detectIOS() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Detect Android device
 */
function detectAndroid() {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent || '');
}

/**
 * useInstallPrompt: Manages PWA installation lifecycle and prompts.
 * Guarantees that if the app is NOT installed, the install trigger is ALWAYS available.
 */
export default function useInstallPrompt() {
  const deferredPromptRef = useRef(null);
  const [isPromptReady, setIsPromptReady] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isIOS] = useState(() => detectIOS());
  const [isAndroid] = useState(() => detectAndroid());

  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      // Prevent automatic mini-infobar on mobile
      event.preventDefault();
      deferredPromptRef.current = event;
      setIsPromptReady(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      deferredPromptRef.current = null;
      setIsPromptReady(false);
      setShowGuide(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e) => {
      if (e.matches) {
        setIsInstalled(true);
        setShowGuide(false);
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
   * Triggers native install prompt or opens guided modal if native prompt is unavailable
   */
  const promptInstall = useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (prompt) {
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
        deferredPromptRef.current = null;
        setIsPromptReady(false);
      } catch (err) {
        console.warn('Native install prompt failed, opening guide:', err);
        setShowGuide(true);
      }
    } else {
      // On iOS or when beforeinstallprompt has not fired, show visual guide
      setShowGuide(true);
    }
  }, []);

  const closeGuide = useCallback(() => {
    setShowGuide(false);
  }, []);

  return {
    isInstalled,
    canShowPrompt: !isInstalled,
    isPromptReady,
    promptInstall,
    showGuide,
    setShowGuide,
    closeGuide,
    isIOS,
    isAndroid,
  };
}
