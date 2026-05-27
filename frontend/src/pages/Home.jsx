import React from "react";
import CustomerForm from "../components/forms/CustomerForm";
import { FiPlusCircle, FiFileText } from "react-icons/fi";

function Home() {
  return (
    <div className="max-w-2xl mx-auto my-6 px-4">
      {/* Dynamic Header details */}
      <div className="bg-white rounded-lg border border-brand-gray-200 shadow-sm overflow-hidden">
        {/* Workspace banner */}
        <div className="bg-brand-navy-900 text-white px-6 py-5 flex items-center justify-between border-b border-brand-navy-900">
          <div className="flex items-center space-x-3">
            <FiPlusCircle className="w-6 h-6 text-brand-yellow" />
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider">New Quotation Estimate</h2>
              <p className="text-[10px] text-brand-navy-200 uppercase tracking-widest font-semibold mt-0.5">
                Input Customer & Borewell Details
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs text-brand-yellow font-mono font-bold bg-brand-navy-800 px-2 py-0.5 rounded shadow-inner">
            <FiFileText className="w-3.5 h-3.5" />
            <span>EST-2026</span>
          </div>
        </div>

        {/* Input form wrapper */}
        <div className="p-6">
          <CustomerForm />
        </div>
      </div>
    </div>
  );
}

export default Home;
