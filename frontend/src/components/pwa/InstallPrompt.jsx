import { useState, useEffect } from 'react';
import { FiDownload, FiShare } from 'react-icons/fi';

/**
 * InstallPrompt — a professional, bottom-anchored card that suggests
 * installing the PWA. Handles both Android/Chrome and iOS Safari flows.
 *
 * Props:
 *  - canShowPrompt  (boolean)  — true when the beforeinstallprompt event fired
 *  - promptInstall  (function) — triggers the native install dialog
 *  - dismissPrompt  (function) — hides the prompt
 *  - isIOSSafari    (boolean)  — true when running in iOS Safari (non-standalone)
 */
export default function InstallPrompt({
  canShowPrompt,
  promptInstall,
  dismissPrompt,
  isIOSSafari,
}) {
  const [visible, setVisible] = useState(false);

  const shouldRender = canShowPrompt || isIOSSafari;

  // Trigger slide-up on mount
  useEffect(() => {
    if (shouldRender) {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-50 flex justify-center pointer-events-none transition-transform duration-500 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="pointer-events-auto w-full max-w-sm mx-auto rounded-t-xl bg-[#1e3a8a] text-white shadow-lg overflow-hidden">
        {isIOSSafari ? (
          /* ── iOS Safari variant ── */
          <div className="px-5 py-4 flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <FiShare size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm">Install Standard Pumps</p>
              <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                Tap the{' '}
                <span className="inline-flex items-center align-middle">
                  <FiShare size={12} className="mx-0.5" />
                </span>{' '}
                share button and select &quot;Add to Home Screen&quot;
              </p>
            </div>
            <button
              type="button"
              onClick={dismissPrompt}
              className="mt-1 text-xs font-medium text-blue-200 hover:text-white transition-colors"
            >
              Got It
            </button>
          </div>
        ) : (
          /* ── Android / Chrome variant ── */
          <div className="px-5 py-4 flex items-start gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
              <FiDownload size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Install Standard Pumps</p>
              <p className="text-xs text-blue-200 mt-0.5">
                Add to your home screen for quick access
              </p>

              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={promptInstall}
                  className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[#fbbf24] text-[#102a43] hover:bg-yellow-300 transition-colors"
                >
                  Install
                </button>
                <button
                  type="button"
                  onClick={dismissPrompt}
                  className="text-xs text-blue-200 hover:text-white transition-colors"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
