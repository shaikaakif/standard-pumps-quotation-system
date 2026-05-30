import React from "react";
import { useSettings } from "../../hooks/useSettings";

function GrandTotal({ totals }) {
  const { settings } = useSettings();
  return (
    <div className="quotation-card-group">
      {/* Grid wrapping Signature area vs invoice calculations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-4">
        {/* Authorized Signature Placeholder (left side) */}
        <div className="pb-4">
          <div className="border border-dashed border-brand-gray-300 rounded-md p-5 text-center bg-brand-gray-50/30 w-full max-w-[260px] mx-auto md:mx-0">
            <div className="h-14 flex items-center justify-center text-3xl text-brand-primary font-calligraphy font-semibold">
              SHAIK ASIF
            </div>
            <div className="border-t border-brand-gray-300 pt-2 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
              Authorized Signatory
            </div>
          </div>
        </div>

        {/* Invoice Summary Totals (right side) */}
        <div className="bg-brand-gray-50 rounded-lg border border-brand-gray-200 p-4 space-y-3.5 w-full max-w-[340px] ml-auto">
          <div className="flex justify-between text-xs font-semibold text-brand-gray-550">
            <span>Subtotal:</span>
            <span className="font-mono text-brand-navy-900">
              Rs. {totals.subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
          </div>

          <div className="flex justify-between text-xs font-semibold text-green-600">
            <span>Discount ({totals.discount_percentage}%):</span>
            <span className="font-mono">
              - Rs. {totals.discount_amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
          </div>

          {/* Premium highlighted Grand Total Banner */}
          <div className="bg-brand-navy-900 text-white rounded-md p-3.5 flex justify-between items-center shadow border-b-4 border-brand-yellow">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-navy-200">
              Grand Total
            </span>
            <span className="text-base font-extrabold font-mono text-brand-yellow tracking-tight">
              Rs. {totals.grand_total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GrandTotal;
