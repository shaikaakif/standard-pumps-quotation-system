import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiDollarSign, FiEdit, FiSliders, FiPackage, FiZap, FiExternalLink } from "react-icons/fi";
import PricingConfigModal from "./PricingConfigModal";
import { quotationService } from "../../services/quotationService";

export default function PricingRatesCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const config = quotationService.getPricingConfig();

  // Calculate motor models count
  let totalMotors = 0;
  if (config.motors) {
    Object.values(config.motors).forEach((b) => {
      totalMotors += (b.models || []).length;
    });
  }

  return (
    <>
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-brand-gray-200 transition-all hover:border-brand-primary/40 relative overflow-hidden">
        {/* Subtle accent corner badge */}
        <div className="absolute top-0 right-0 bg-gradient-to-l from-brand-primary/10 to-transparent px-4 py-1 text-[10px] font-black uppercase tracking-wider text-brand-primary rounded-bl-xl border-l border-b border-brand-primary/10">
          Turnkey Quotation Engine
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-primary to-blue-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <FiDollarSign className="w-6 h-6 text-brand-accent" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-brand-navy-950 uppercase tracking-tight">
                  Quotation Rates & Material Prices
                </h3>
              </div>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed max-w-xl">
                Edit prices for submersible motors, column pipes, cables, starter panels, accessories, and labor charges. Customise depth ranges and add new motor brands.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all"
            >
              <FiEdit className="w-4 h-4" />
              <span>Edit Prices & Ranges</span>
            </button>
            <Link
              to="/settings/pricing"
              className="p-2.5 rounded-xl border border-brand-gray-300 hover:bg-brand-gray-100 text-brand-muted hover:text-brand-primary transition-colors"
              title="Open full-page manager"
            >
              <FiExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Live Config Summary Stats Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-brand-gray-100 text-xs">
          <div className="p-2.5 bg-brand-gray-50 rounded-xl border border-brand-gray-200 flex items-center space-x-2">
            <FiZap className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-brand-muted block">Motors</span>
              <span className="font-extrabold text-brand-navy-900">{totalMotors} Configured</span>
            </div>
          </div>

          <div className="p-2.5 bg-brand-gray-50 rounded-xl border border-brand-gray-200 flex items-center space-x-2">
            <FiPackage className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-brand-muted block">Pipes (Per M)</span>
              <span className="font-extrabold text-brand-navy-900">{config.pipes?.rates?.length || 3} Tiers (10-16KG)</span>
            </div>
          </div>

          <div className="p-2.5 bg-brand-gray-50 rounded-xl border border-brand-gray-200 flex items-center space-x-2">
            <FiSliders className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-brand-muted block">Cables</span>
              <span className="font-extrabold text-brand-navy-900">Sudhakar & Local</span>
            </div>
          </div>

          <div className="p-2.5 bg-brand-gray-50 rounded-xl border border-brand-gray-200 flex items-center space-x-2">
            <FiDollarSign className="w-4 h-4 text-purple-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-brand-muted block">Fitting</span>
              <span className="font-extrabold text-brand-navy-900">{config.fitting_charges?.ranges?.length || 3} Depth Tiers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up Window Modal */}
      <PricingConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
