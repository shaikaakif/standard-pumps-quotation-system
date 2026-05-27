import React, { useState } from "react";
import { FiClock, FiMap, FiTrash2, FiFolder, FiSmartphone, FiCreditCard, FiActivity } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

/**
 * Deterministic date formatter ensuring clean calendar visuals
 * free of browser-locale parsing discrepancies.
 */
const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    
    const day = String(d.getDate()).padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${day} ${month} ${year}, ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  } catch (e) {
    return dateString;
  }
};

function HistoryCard({ item, onReopen, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReopening, setIsReopening] = useState(false);

  const handleReopen = async () => {
    setIsReopening(true);
    try {
      await onReopen(item.quotation_id);
    } finally {
      setIsReopening(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the quotation for "${item.customer_name}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(item.quotation_id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white border border-brand-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden quotation-card-group">
      
      {/* Detail Block */}
      <div className="space-y-1.5 flex-grow">
        {/* Name and Mode Badge Row */}
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-bold text-brand-navy-900 capitalize leading-none">
            {item.customer_name}
          </h4>

          {item.mode === "STANDARD" ? (
            <span className="flex items-center space-x-0.5 bg-brand-navy-950 text-brand-yellow text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm border border-brand-yellow/20">
              <FaStar className="w-2.5 h-2.5 fill-brand-yellow text-brand-yellow" />
              <span>Premium</span>
            </span>
          ) : (
            <span className="bg-brand-gray-200 text-brand-navy-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-brand-gray-300">
              Regular
            </span>
          )}
        </div>

        {/* Info list */}
        <div className="grid grid-cols-2 xs:flex xs:flex-wrap gap-x-4 gap-y-1 text-xs text-brand-gray-550">
          <span className="flex items-center">
            <FiSmartphone className="w-3.5 h-3.5 mr-1 text-brand-navy-500" />
            <span>{item.phone}</span>
          </span>
          <span className="flex items-center">
            <FiMap className="w-3.5 h-3.5 mr-1 text-brand-navy-500" />
            <span>{item.feet} FT</span>
          </span>
          <span className="flex items-center col-span-2 xs:col-span-1">
            <FiClock className="w-3.5 h-3.5 mr-1 text-brand-navy-500" />
            <span>{formatDate(item.created_at)}</span>
          </span>
        </div>
      </div>

      {/* Pricing & Actions block */}
      <div className="flex sm:flex-col items-end sm:items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-t-0 border-brand-gray-100 pt-3.5 sm:pt-0 gap-2 shrink-0">
        
        {/* Grand Total */}
        <div className="flex items-center space-x-1 sm:text-right">
          <FiCreditCard className="w-3.5 h-3.5 text-brand-navy-500 sm:hidden" />
          <span className="text-xs font-semibold text-brand-gray-550 mr-1 sm:hidden">Total:</span>
          <span className="text-sm font-black text-brand-navy-800">
            ₹{item.grand_total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          {/* Soft Delete */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isReopening}
            className="p-2 text-brand-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all disabled:opacity-50 shrink-0"
            title="Delete estimate"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>

          {/* Reopen */}
          <button
            type="button"
            onClick={handleReopen}
            disabled={isDeleting || isReopening}
            className="flex items-center space-x-1 bg-brand-navy-800 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded hover:bg-brand-navy-900 transition-all shadow-sm shrink-0 disabled:opacity-75"
          >
            {isReopening ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
            ) : (
              <FiFolder className="w-3.5 h-3.5" />
            )}
            <span>Reopen</span>
          </button>
        </div>

      </div>

    </div>
  );
}

export default HistoryCard;
