import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import BottomNav from "../components/layout/BottomNav";
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
const Customers = lazy(() => import("../pages/Customers"));
const Settings = lazy(() => import("../pages/Settings"));

function AppRoutes() {
  // PWA connectivity hooks
  const { isOnline, isBackendAvailable } = useOnlineStatus();
  const { 
    isInstalled, 
    promptInstall, 
    showGuide, 
    closeGuide, 
    isIOS, 
    isAndroid 
  } = useInstallPrompt();

  return (
    <div className="flex flex-col min-h-screen bg-brand-gray-100 text-brand-navy-900 font-sans">
      {/* Universal header layout with status indicators */}
      <Navbar isOnline={isOnline} isBackendAvailable={isBackendAvailable} />

      {/* Offline connectivity banner */}
      <OfflineBanner isOnline={isOnline} isBackendAvailable={isBackendAvailable} />

      {/* Main Container with lazy-loaded routes - optimized for mobile PWA viewports */}
      <main className="flex-grow w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-6 pb-20 sm:pb-6">
        <Suspense fallback={<SplashScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/history" element={<History />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/settings" element={<Settings />} />

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>

      {/* Trust Footer */}
      <footer className="bg-brand-gray-200 border-t border-brand-gray-300 py-4 pb-20 sm:pb-4 text-center text-xs text-brand-muted hidden sm:block">
        <p>© 2026 Standard Pumps & Borewell. Estimates are estimates only.</p>
      </footer>

      <BottomNav />

      {/* PWA Install Prompt & Guided Installation */}
      <InstallPrompt
        isInstalled={isInstalled}
        promptInstall={promptInstall}
        showGuide={showGuide}
        closeGuide={closeGuide}
        isIOS={isIOS}
        isAndroid={isAndroid}
      />

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
