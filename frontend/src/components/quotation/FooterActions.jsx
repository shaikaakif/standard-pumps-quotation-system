import React from "react";
import { Link } from "react-router-dom";
import { FiDownload, FiShare2, FiPlusCircle, FiArrowLeft, FiPrinter } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

function FooterActions({ onReset, onDownloadPdf, onShareWhatsapp, onShare, isGeneratingPdf }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-brand-surface border border-brand-gray-200 rounded-xl p-4 no-print quotation-card-group shadow-sm w-full max-w-[800px] mx-auto pb-24 sm:pb-4">
      {/* Back button (Hidden on mobile inside sticky footer, we just show actions) */}
      <Link
        to="/"
        className="hidden sm:flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted hover:text-brand-primary transition-colors py-2 px-3 hover:bg-brand-gray-100 rounded shrink-0"
      >
        <FiArrowLeft className="w-4 h-4" />
        <span>Back to Form</span>
      </Link>

      {/* Sticky Bottom Action Bar on Mobile / Standard on Desktop */}
      <div className="sm:relative fixed bottom-16 sm:bottom-auto left-0 right-0 p-4 sm:p-0 bg-brand-surface sm:bg-transparent border-t border-brand-gray-200 sm:border-none shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:shadow-none z-40 flex flex-row gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
        {/* Print button */}
        <button
          type="button"
          onClick={handlePrint}
          disabled={isGeneratingPdf}
          className="flex items-center justify-center space-x-1.5 bg-white border border-brand-gray-300 text-brand-navy-900 text-xs font-bold uppercase tracking-wider py-2 px-3.5 rounded hover:bg-brand-gray-100 transition-all shadow-sm shrink-0 disabled:opacity-50"
          title="Open browser print preview"
        >
          <FiPrinter className="w-4 h-4" />
          <span className="hidden xs:inline">Print</span>
        </button>

        {/* Copy / Share button */}
        <button
          type="button"
          onClick={onShare}
          disabled={isGeneratingPdf}
          className="flex items-center justify-center space-x-1.5 bg-brand-navy-100 text-brand-navy-900 text-xs font-bold uppercase tracking-wider py-2 px-3.5 rounded hover:bg-brand-navy-200 transition-all shadow-sm shrink-0 disabled:opacity-50"
        >
          <FiShare2 className="w-4 h-4 text-brand-navy-800" />
          <span>Share / Copy</span>
        </button>

        {/* WhatsApp Share button */}
        <button
          type="button"
          onClick={onShareWhatsapp}
          disabled={isGeneratingPdf}
          className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-brand-green text-white text-xs font-bold uppercase tracking-wider py-3 sm:py-2 px-4 rounded-lg sm:rounded hover:bg-brand-green-hover transition-all shadow-sm shrink-0 disabled:opacity-50"
        >
          <FaWhatsapp className="w-4 h-4 sm:w-4 sm:h-4" />
          <span>WhatsApp</span>
        </button>

        {/* Download PDF button */}
        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={isGeneratingPdf}
          className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-brand-primary text-white text-xs font-bold uppercase tracking-wider py-3 sm:py-2 px-4 rounded-lg sm:rounded hover:bg-brand-primary/90 transition-all shadow-sm shrink-0 disabled:opacity-50"
        >
          <FiDownload className="w-4 h-4" />
          <span>{isGeneratingPdf ? "..." : "PDF"}</span>
        </button>

        {/* New Quotation button */}
        <button
          type="button"
          onClick={onReset}
          disabled={isGeneratingPdf}
          className="flex items-center justify-center space-x-1.5 bg-brand-yellow text-brand-navy-900 text-xs font-bold uppercase tracking-wider py-2 px-4 rounded hover:bg-brand-yellow-hover transition-all shadow-sm shrink-0 disabled:opacity-50"
        >
          <FiPlusCircle className="w-4 h-4" />
          <span>New</span>
        </button>
      </div>
    </div>
  );
}

export default FooterActions;
