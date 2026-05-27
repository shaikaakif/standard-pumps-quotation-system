import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import SplashScreen from "../components/pwa/SplashScreen";
import OfflineBanner from "../components/pwa/OfflineBanner";
import InstallPrompt from "../components/pwa/InstallPrompt";
import UpdateNotification from "../components/pwa/UpdateNotification";
import useOnlineStatus from "../hooks/useOnlineStatus";
import useInstallPrompt from "../hooks/useInstallPrompt";

// Lazy-loaded page components for code splitting
const Home = lazy(() => import("../pages/Home"));
const Preview = lazy(() => import("../pages/Preview"));
const History = lazy(() => import("../pages/History"));
const Settings = lazy(() => import("../pages/Settings"));

function AppRoutes() {
  // PWA connectivity hooks
  const { isOnline, isBackendAvailable } = useOnlineStatus();
  const { canShowPrompt, promptInstall, dismissPrompt, isInstalled, isIOSSafari } = useInstallPrompt();

  return (
    <div className="flex flex-col min-h-screen bg-brand-gray-100 text-brand-navy-900 font-sans">
      {/* Universal header layout with status indicators */}
      <Navbar isOnline={isOnline} isBackendAvailable={isBackendAvailable} />

      {/* Offline connectivity banner */}
      <OfflineBanner isOnline={isOnline} isBackendAvailable={isBackendAvailable} />

      {/* Main Container with lazy-loaded routes */}
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-6">
        <Suspense fallback={<SplashScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>

      {/* Trust Footer */}
      <footer className="bg-brand-gray-200 border-t border-brand-gray-300 py-4 text-center text-xs text-brand-gray-550">
        <p>© 2026 Standard Pumps & Borewell. Estimates are estimates only.</p>
      </footer>

      {/* PWA Install Prompt (bottom-anchored) */}
      {!isInstalled && (
        <InstallPrompt
          canShowPrompt={canShowPrompt}
          promptInstall={promptInstall}
          dismissPrompt={dismissPrompt}
          isIOSSafari={isIOSSafari}
        />
      )}

      {/* Service Worker Update Notification */}
      <UpdateNotification
        needsUpdate={false}
        onUpdate={() => {
          // Future: trigger SW update from useRegisterSW
          window.location.reload();
        }}
      />
    </div>
  );
}

export default AppRoutes;
