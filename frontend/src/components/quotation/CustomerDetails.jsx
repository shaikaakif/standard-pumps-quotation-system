import React from "react";
import { FiUser, FiPhone, FiCompass, FiShield, FiZap } from "react-icons/fi";

function CustomerDetails({ customerName, phone, feet, mode, phase }) {
  return (
    <div className="bg-brand-gray-50 rounded-lg border border-brand-gray-200 p-4 mb-5 quotation-card-group">
      <h3 className="text-xs font-bold text-brand-navy-800 uppercase tracking-widest border-b border-brand-gray-200 pb-2 mb-3">
        Customer & Borewell Specifications
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Name */}
        <div className="flex items-start space-x-2.5">
          <div className="bg-white p-2 rounded border border-brand-gray-200 text-brand-navy-800 shrink-0">
            <FiUser className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-wider">Customer</div>
            <div className="text-sm font-bold text-brand-navy-900 leading-tight mt-0.5">{customerName}</div>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start space-x-2.5">
          <div className="bg-white p-2 rounded border border-brand-gray-200 text-brand-navy-800 shrink-0">
            <FiPhone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-wider">Phone</div>
            <div className="text-sm font-bold text-brand-navy-900 leading-tight mt-0.5">{phone}</div>
          </div>
        </div>

        {/* Bore Depth */}
        <div className="flex items-start space-x-2.5">
          <div className="bg-white p-2 rounded border border-brand-gray-200 text-brand-navy-800 shrink-0">
            <FiCompass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-wider">Bore Depth</div>
            <div className="text-sm font-bold text-brand-navy-900 leading-tight mt-0.5">{feet} Feet</div>
          </div>
        </div>

        {/* Material Mode */}
        <div className="flex items-start space-x-2.5">
          <div className="bg-white p-2 rounded border border-brand-gray-200 text-brand-navy-800 shrink-0">
            <FiShield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-wider">Material Mode</div>
            <div className="text-sm font-bold text-brand-navy-900 leading-tight mt-0.5 uppercase tracking-wide">
              {mode} Grade
            </div>
          </div>
        </div>

        {/* Phase */}
        <div className="flex items-start space-x-2.5">
          <div className="bg-white p-2 rounded border border-brand-gray-200 text-brand-navy-800 shrink-0">
            <FiZap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-wider">Electrical compatibility</div>
            <div className="text-sm font-bold text-brand-navy-900 leading-tight mt-0.5 capitalize">
              {phase === "single" ? "Single Phase (230V)" : "Three Phase (415V)"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetails;
