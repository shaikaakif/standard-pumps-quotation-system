import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiDollarSign } from "react-icons/fi";
import PricingConfigModal from "../components/settings/PricingConfigModal";

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto py-4 px-2 sm:px-4 space-y-4">
      {/* Top Header Strip */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-gray-200">
        <Link
          to="/settings"
          className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted hover:text-brand-primary transition-colors py-1.5 px-3 hover:bg-brand-gray-100 rounded-xl"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </Link>
        <span className="text-xs font-bold text-brand-muted">
          Standard Pumps Rate Master
        </span>
      </div>

      {/* Render the full-screen modal directly */}
      <PricingConfigModal isOpen={true} onClose={() => window.history.back()} />
    </div>
  );
}
