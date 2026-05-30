import React from "react";
import { NavLink } from "react-router-dom";
import { FiFileText, FiClock, FiSettings } from "react-icons/fi";

function BottomNav() {
  const navLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
      isActive ? "text-brand-primary font-bold" : "text-brand-muted hover:text-brand-primary"
    }`;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 h-16 flex items-center justify-around pb-safe">
      <NavLink to="/" className={navLinkClass}>
        <FiFileText className="w-5 h-5" />
        <span className="text-[10px] uppercase tracking-wider">Estimator</span>
      </NavLink>

      <NavLink to="/history" className={navLinkClass}>
        <FiClock className="w-5 h-5" />
        <span className="text-[10px] uppercase tracking-wider">History</span>
      </NavLink>

      <NavLink to="/settings" className={navLinkClass}>
        <FiSettings className="w-5 h-5" />
        <span className="text-[10px] uppercase tracking-wider">Settings</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;
