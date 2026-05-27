/**
 * SplashScreen — a lightweight, premium-feeling startup splash
 * used as a React Suspense fallback. Renders instantly with
 * CSS-only animations (no external libraries, no artificial delays).
 */
export default function SplashScreen() {
  const appLogo = typeof window !== 'undefined' ? localStorage.getItem('spqs_app_logo') : null;
  return (
    <>
      {/* Scoped keyframes for the dot pulse */}
      <style>{`
        @keyframes spqs-dot-pulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1e3a8a] select-none">
        {/* ── Brand Badge ── */}
        {appLogo ? (
          <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center shadow-lg p-2">
            <img src={appLogo} alt="App Logo" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-xl bg-[#fbbf24] flex items-center justify-center shadow-lg">
            <span className="text-[#102a43] text-xl font-extrabold tracking-wide">
              SPQS
            </span>
          </div>
        )}

        {/* ── Brand Name ── */}
        <h1 className="mt-5 text-white text-lg font-bold uppercase tracking-wider">
          Standard Pumps
        </h1>
        <p className="mt-1 text-[#d9e2ec] text-sm tracking-wide">
          Quotation System
        </p>

        {/* ── Dot Loader ── */}
        <div className="mt-10 flex items-center gap-2" aria-label="Loading">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-2 h-2 rounded-full bg-white"
              style={{
                animation: 'spqs-dot-pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
