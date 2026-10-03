import React, { useState, useEffect } from 'react';
import { FiDownload, FiShare, FiX, FiCheckCircle, FiSmartphone, FiPlusSquare } from 'react-icons/fi';

/**
 * InstallPrompt — Professional mobile-friendly PWA installation banner and step-by-step modal guide.
 */
export default function InstallPrompt({
  isInstalled,
  promptInstall,
  showGuide,
  closeGuide,
  isIOS,
  isAndroid,
}) {
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // If already running as installed standalone app, never render
  if (isInstalled) return null;

  return (
    <>
      {/* ── 1. BOTTOM FLOATING INSTALL BANNER (Appears if not installed) ── */}
      {!bannerDismissed && (
        <div className="fixed bottom-16 sm:bottom-4 inset-x-2 sm:inset-x-auto sm:right-4 sm:max-w-md z-40 transition-all duration-300">
          <div className="bg-brand-navy-950 text-white rounded-2xl p-3 sm:p-3.5 shadow-2xl border border-brand-accent/40 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-brand-accent text-brand-navy-950 font-black flex items-center justify-center shrink-0 shadow">
                <span className="text-sm">SP</span>
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate flex items-center gap-1.5">
                  <span>Install App</span>
                  <span className="text-[9px] bg-brand-accent text-brand-navy-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                    PWA
                  </span>
                </h4>
                <p className="text-[11px] text-brand-navy-200 mt-0.5 truncate">
                  Add to home screen for 1-tap instant quotes
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={promptInstall}
                className="bg-brand-accent hover:bg-yellow-400 text-brand-navy-950 font-black text-xs uppercase tracking-wider px-3 py-2 rounded-xl transition-all shadow-sm active:scale-95"
              >
                Install
              </button>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                className="p-1.5 text-brand-navy-300 hover:text-white rounded-lg transition-colors"
                title="Dismiss"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. STEP-BY-STEP INSTALLATION MODAL GUIDE (For iOS & Manual Installs) ── */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-brand-gray-200 w-full max-w-sm overflow-hidden">
            {/* Header */}
            <div className="bg-brand-primary text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-accent/20 text-brand-accent flex items-center justify-center">
                  <FiSmartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Install Standard Pumps
                  </h3>
                  <p className="text-[10px] text-brand-navy-200 uppercase tracking-widest font-medium">
                    Native Mobile Setup
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeGuide}
                className="p-1 text-white/70 hover:text-white rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Guide Body */}
            <div className="p-5 space-y-4 text-brand-navy-900 text-xs">
              {isIOS ? (
                /* iOS Safari instructions */
                <>
                  <p className="text-brand-muted text-xs leading-relaxed">
                    Follow these 3 quick steps on your iPhone or iPad:
                  </p>
                  <ol className="space-y-3 font-medium">
                    <li className="flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Tap the <strong>Share</strong> button (
                        <FiShare className="inline w-3.5 h-3.5 mx-0.5 text-blue-600" />
                        ) at the bottom of Safari.
                      </span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong> (
                        <FiPlusSquare className="inline w-3.5 h-3.5 mx-0.5 text-brand-primary" />
                        ).
                      </span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Tap <strong>Add</strong> in the top-right corner. The app icon will appear on your home screen!
                      </span>
                    </li>
                  </ol>
                </>
              ) : (
                /* Android / Chrome instructions */
                <>
                  <p className="text-brand-muted text-xs leading-relaxed">
                    To install directly on your Android phone:
                  </p>
                  <ol className="space-y-3 font-medium">
                    <li className="flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Tap the <strong>3 vertical dots</strong> (<strong>⋮</strong>) in the top-right of Chrome.
                      </span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                      </span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Confirm installation. Standard Pumps will launch like a native Android app!
                      </span>
                    </li>
                  </ol>
                </>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={closeGuide}
                  className="w-full py-2.5 bg-brand-primary text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-brand-primary/90 transition-all shadow-sm"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
