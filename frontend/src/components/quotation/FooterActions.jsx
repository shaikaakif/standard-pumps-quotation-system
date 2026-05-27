import React from "react";
import { Link } from "react-router-dom";
import { FiDownload, FiShare2, FiPlusCircle, FiArrowLeft, FiPrinter } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

function FooterActions({ onReset, onDownloadPdf, onShareWhatsapp, onShare, isGeneratingPdf }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-4 no-print quotation-card-group shadow-sm w-full max-w-[800px] mx-auto">
      {/* Back button */}
      <Link
        to="/"
        className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-brand-gray-550 hover:text-brand-navy-800 transition-colors py-2 px-3 hover:bg-brand-gray-200 rounded shrink-0"
      >
        <FiArrowLeft className="w-4 h-4" />
        <span>Back to Form</span>
      </Link>

      {/* Share / PDF action buttons */}
      <div className="flex flex-wrap gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
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
          className="flex items-center justify-center space-x-1.5 bg-brand-green text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded hover:bg-brand-green-hover transition-all shadow-sm shrink-0 disabled:opacity-50"
        >
          <FaWhatsapp className="w-4 h-4 text-white" />
          <span>WhatsApp</span>
        </button>

        {/* Download PDF button */}
        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={isGeneratingPdf}
          className="flex items-center justify-center space-x-1.5 bg-brand-navy-800 text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded hover:bg-brand-navy-900 transition-all shadow-sm shrink-0 disabled:opacity-50"
        >
          <FiDownload className="w-4 h-4" />
          <span>{isGeneratingPdf ? "Generating..." : "Download PDF"}</span>
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
