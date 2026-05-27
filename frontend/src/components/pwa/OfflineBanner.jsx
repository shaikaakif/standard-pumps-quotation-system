import { useState, useEffect, useRef } from 'react';
import { FiWifiOff, FiServer, FiX } from 'react-icons/fi';

/**
 * OfflineBanner — a compact, non-intrusive notification bar that appears
 * below the navbar when the device goes offline or the backend is unreachable.
 *
 * Props:
 *  - isOnline          (boolean) — navigator.onLine status
 *  - isBackendAvailable (boolean) — whether the API server responds
 */
export default function OfflineBanner({ isOnline, isBackendAvailable }) {
  const [dismissed, setDismissed] = useState(false);
  const prevStatusRef = useRef({ isOnline, isBackendAvailable });

  // Re-show the banner whenever the status *changes*
  useEffect(() => {
    const prev = prevStatusRef.current;
    if (prev.isOnline !== isOnline || prev.isBackendAvailable !== isBackendAvailable) {
      setDismissed(false);
      prevStatusRef.current = { isOnline, isBackendAvailable };
    }
  }, [isOnline, isBackendAvailable]);

  const isOffline = !isOnline;
  const isBackendDown = isOnline && !isBackendAvailable;
  const shouldShow = (isOffline || isBackendDown) && !dismissed;

  const bannerConfig = isOffline
    ? {
        bg: 'bg-amber-500',
        text: 'text-amber-950',
        icon: <FiWifiOff className="shrink-0" />,
        message: 'You are offline — some features may be unavailable',
      }
    : {
        bg: 'bg-[#d9e2ec]',
        text: 'text-[#102a43]',
        icon: <FiServer className="shrink-0" />,
        message: 'Backend server unreachable — using cached data',
      };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-14 inset-x-0 z-40 transition-transform duration-300 ease-in-out ${
        shouldShow ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div
        className={`${bannerConfig.bg} ${bannerConfig.text} py-2 px-4 flex items-center justify-center gap-2 text-xs font-medium`}
      >
        {bannerConfig.icon}
        <span>{bannerConfig.message}</span>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="ml-auto p-0.5 rounded hover:opacity-70 transition-opacity"
          aria-label="Dismiss notification"
        >
          <FiX size={14} />
        </button>
      </div>
    </div>
  );
}
