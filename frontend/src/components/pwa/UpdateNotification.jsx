import { useState, useEffect } from 'react';
import { FiRefreshCw, FiX } from 'react-icons/fi';

/**
 * UpdateNotification — a compact, bottom-right toast that appears when
 * a new service-worker version has been detected and is ready to activate.
 *
 * Props:
 *  - needsUpdate (boolean)  — true when a waiting SW is available
 *  - onUpdate    (function) — triggers skipWaiting + reload
 */
export default function UpdateNotification({ needsUpdate, onUpdate }) {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  const shouldRender = needsUpdate && !dismissed;

  // Slide-up on mount
  useEffect(() => {
    if (shouldRender) {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
  }, [shouldRender]);

  // Reset dismissed state when needsUpdate goes false→true again
  useEffect(() => {
    if (needsUpdate) setDismissed(false);
  }, [needsUpdate]);

  if (!shouldRender) return null;

  return (
    <div
      role="alert"
      className={`fixed bottom-4 right-4 z-50 w-72 transition-transform duration-300 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-8'
      }`}
    >
      <div className="bg-[#102a43] text-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-3 flex items-start gap-3">
          {/* Icon */}
          <div className="w-8 h-8 shrink-0 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
            <FiRefreshCw size={16} className="text-[#fbbf24]" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-snug">
              A new version is available
            </p>
            <button
              type="button"
              onClick={onUpdate}
              className="mt-2 px-3 py-1 text-xs font-semibold rounded bg-[#fbbf24] text-[#102a43] hover:bg-yellow-300 transition-colors"
            >
              Update Now
            </button>
          </div>

          {/* Dismiss */}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
            aria-label="Dismiss update notification"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
