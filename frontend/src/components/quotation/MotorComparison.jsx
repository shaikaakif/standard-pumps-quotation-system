import React from "react";
import { FiCheckCircle, FiLayers } from "react-icons/fi";

/**
 * MotorComparison: Renders alternative motor brand choices with their
 * corresponding complete turnkey package grand totals directly on the quotation page.
 */
export default function MotorComparison({ motorOptions = [] }) {
  if (!motorOptions || motorOptions.length <= 1) return null;

  return (
    <div className="bg-white border border-brand-navy-800 rounded-lg overflow-hidden mb-4 quotation-card-group shadow-xs">
      {/* Header Banner */}
      <div className="bg-brand-navy-900 text-white px-3.5 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FiLayers className="w-4 h-4 text-brand-yellow" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Alternative Motor Brand Options & Complete Package Totals
          </h3>
        </div>
        <span className="text-[9px] uppercase font-bold tracking-wider bg-brand-yellow text-brand-navy-900 px-2 py-0.5 rounded">
          Customer Choice Guide
        </span>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-brand-navy-50/60 text-brand-navy-900 border-b border-brand-gray-200 text-[10px] uppercase font-bold tracking-wider">
              <th className="px-3 py-2">Motor Brand & Specification</th>
              <th className="px-3 py-2 text-center">Type</th>
              <th className="px-3 py-2 text-right">Motor Rate (₹)</th>
              <th className="px-3 py-2 text-right">Complete Package Grand Total (₹)</th>
              <th className="px-3 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-200">
            {motorOptions.map((opt, idx) => {
              const isSelected = opt.is_primary;
              return (
                <tr
                  key={`${opt.brand}-${opt.spec}-${idx}`}
                  className={`transition-colors ${
                    isSelected
                      ? "bg-amber-50/60 font-semibold text-brand-navy-900"
                      : "hover:bg-brand-gray-50/40 text-brand-text"
                  }`}
                >
                  {/* Brand & Spec */}
                  <td className="px-3 py-2">
                    <div className="font-bold text-brand-navy-900 flex items-center space-x-1.5">
                      <span>{opt.brand}</span>
                      {opt.is_custom && (
                        <span className="text-[9px] font-bold uppercase bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-brand-muted mt-0.5">{opt.spec}</div>
                  </td>

                  {/* Type Badge */}
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        opt.is_premium
                          ? "bg-amber-100 text-amber-800"
                          : "bg-brand-gray-100 text-brand-muted"
                      }`}
                    >
                      {opt.is_premium ? "Premium" : "Economy"}
                    </span>
                  </td>

                  {/* Standalone Motor Price */}
                  <td className="px-3 py-2 text-right font-mono text-brand-muted">
                    ₹{Number(opt.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Turnkey Complete Package Grand Total */}
                  <td className="px-3 py-2 text-right font-mono font-bold">
                    <span
                      className={`text-xs sm:text-sm px-2 py-0.5 rounded ${
                        isSelected
                          ? "bg-brand-primary text-white font-black"
                          : "text-brand-navy-900 font-extrabold"
                      }`}
                    >
                      ₹{Number(opt.package_grand_total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>

                  {/* Selection Status */}
                  <td className="px-3 py-2 text-center">
                    {isSelected ? (
                      <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-700 font-bold uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <FiCheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Included Above</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-brand-muted font-medium uppercase">
                        Alternative
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Explanatory Footer Note */}
      <div className="px-3 py-1.5 bg-brand-gray-50 border-t border-brand-gray-200 text-[10px] text-brand-muted flex items-center justify-between">
        <span>* Package Grand Total includes identical Column Pipes, Submersible Cable, Starter Board, Accessories & Fitting Charges.</span>
        <span className="font-semibold text-brand-primary hidden sm:inline">All taxes & discounts applied</span>
      </div>
    </div>
  );
}
