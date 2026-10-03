import { useState, useEffect } from "react";

/**
 * useDevice: Advanced responsive and device detection hook for SPQS PWA.
 * Accurately detects device class, viewport orientation, touch capabilities,
 * operating system, and whether the app is running in standalone PWA mode.
 */
export function useDevice() {
  const getDeviceInfo = () => {
    if (typeof window === "undefined") {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false,
        isStandalone: false,
        isIOS: false,
        isAndroid: false,
        orientation: "portrait",
        width: 1024,
        height: 768,
        deviceType: "desktop",
        isSmallScreen: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const ua = navigator.userAgent || "";
    
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    
    // Check if launched as installed PWA standalone app
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://");

    const isMobile = width < 640 || (isTouch && width < 768 && (isIOS || isAndroid));
    const isTablet = !isMobile && (width < 1024 || (isTouch && width >= 768 && width <= 1180));
    const isDesktop = !isMobile && !isTablet;
    const isSmallScreen = width < 420;

    const orientation = width > height ? "landscape" : "portrait";
    const deviceType = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";

    return {
      isMobile,
      isTablet,
      isDesktop,
      isTouch,
      isStandalone,
      isIOS,
      isAndroid,
      orientation,
      width,
      height,
      deviceType,
      isSmallScreen,
    };
  };

  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo);

  useEffect(() => {
    let timeoutId = null;

    const handleResize = () => {
      // Debounce slightly to prevent thrashing during fast orientation changes
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDeviceInfo(getDeviceInfo());
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Media query listener for standalone mode change
    const standaloneMediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleStandaloneChange = () => setDeviceInfo(getDeviceInfo());
    if (standaloneMediaQuery.addEventListener) {
      standaloneMediaQuery.addEventListener("change", handleStandaloneChange);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (standaloneMediaQuery.removeEventListener) {
        standaloneMediaQuery.removeEventListener("change", handleStandaloneChange);
      }
    };
  }, []);

  return deviceInfo;
}

export default useDevice;
