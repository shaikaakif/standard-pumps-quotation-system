import React from "react";
import { NavLink } from "react-router-dom";
import { FiFileText, FiClock, FiSettings, FiWifi, FiWifiOff, FiServer } from "react-icons/fi";
import { APP_VERSION } from "../../utils/cacheHelpers";
import { useSettings } from "../../hooks/useSettings";

/**
 * Primary navigation bar with connectivity status indicators.
 * Designed for mobile-first shop usage with clear visual feedback.
 *
 * @param {Object} props
 * @param {boolean} props.isOnline - Internet connectivity status
 * @param {boolean} props.isBackendAvailable - Backend server reachability
 */
function Navbar({ isOnline = true, isBackendAvailable = true }) {
  const { logos } = useSettings();
  
  // Determine status chip content
  const getStatusChip = () => {
    if (!isOnline) {
      return (
        <div className="flex items-center space-x-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
          <FiWifiOff className="w-3 h-3" />
          <span>Offline</span>
        </div>
      );
    }
    if (!isBackendAvailable) {
      return (
        <div className="flex items-center space-x-1 bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
          <FiServer className="w-3 h-3" />
          <span>Server Down</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1 bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
        <FiWifi className="w-3 h-3" />
        <span>Online</span>
      </div>
    );
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center space-x-2 px-3.5 py-2 rounded-md text-xs font-bold tracking-wide uppercase transition-all duration-200 ${
      isActive
        ? "bg-brand-navy-900 text-brand-yellow shadow-inner"
        : "text-brand-navy-100 hover:bg-brand-navy-700 hover:text-white"
    }`;

  return (
    <header className="bg-brand-navy-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between sm:h-16 py-3 sm:py-0">
        {/* Brand Identity */}
        <NavLink to="/" className="flex items-center space-x-3 mb-3 sm:mb-0">
          {logos?.appLogo ? (
            <img src={logos.appLogo} alt="App Logo" className="h-8 object-contain rounded bg-white p-1" />
          ) : (
            <div className="bg-brand-yellow px-3 py-1.5 rounded font-bold text-brand-navy-900 tracking-wider text-sm shadow">
              SPQS
            </div>
          )}
          <div>
            <h1 className="text-base font-bold tracking-tight uppercase leading-none">STANDARD PUMPS</h1>
            <div className="flex items-center space-x-2 mt-0.5">
              <p className="text-[10px] text-brand-navy-200 uppercase tracking-widest font-semibold">
                Quotation Automation
              </p>
              {/* App version */}
              <span className="text-[8px] text-brand-navy-300 font-mono">v{APP_VERSION}</span>
            </div>
          </div>
        </NavLink>

        {/* Status + Navigation */}
        <div className="flex items-center space-x-3">
          {/* Connectivity status chip */}
          {getStatusChip()}

          {/* Dynamic Navigation Tabs */}
          <nav className="flex space-x-1 w-full sm:w-auto justify-around sm:justify-end">
            <NavLink to="/" className={navLinkClass}>
              <FiFileText className="w-4 h-4" />
              <span>Estimator</span>
            </NavLink>

            <NavLink to="/history" className={navLinkClass}>
              <FiClock className="w-4 h-4" />
              <span>History</span>
            </NavLink>

            <NavLink to="/settings" className={navLinkClass}>
              <FiSettings className="w-4 h-4" />
              <span>Settings</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
