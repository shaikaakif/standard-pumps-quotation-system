import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiDownload, FiShare2, FiPlusCircle, FiArrowLeft, FiPrinter, FiCopy, FiCheck, FiGift } from "react-icons/fi";
import { FaWhatsapp, FaCrown } from "react-icons/fa";

function FooterActions({ 
  onReset, 
  onDownloadPdf, 
  onShareWhatsapp, 
  onShare, 
  onCopyCaption, 
  onOpenCashback, 
  isInvoice, 
  isGeneratingPdf 
}) {
  const [captionCopied, setCaptionCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCaptionClick = () => {
    if (onCopyCaption) {
      onCopyCaption();
      setCaptionCopied(true);
      setTimeout(() => setCaptionCopied(false), 2500);
    }
  };

  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between items-center bg-brand-surface border border-brand-gray-200 rounded-xl p-3 sm:p-4 no-print quotation-card-group shadow-sm w-full max-w-[800px] mx-auto pb-24 sm:pb-4">
      {/* Back button (Desktop) */}
      <Link
        to="/"
        className="hidden sm:flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted hover:text-brand-primary transition-colors py-2 px-3 hover:bg-brand-gray-100 rounded-lg shrink-0"
      >
        <FiArrowLeft className="w-4 h-4" />
        <span>Back to Form</span>
      </Link>

      {/* Sticky Bottom Action Bar on Mobile / Flex Toolbar on Desktop */}
      <div className="sm:relative fixed bottom-16 sm:bottom-auto left-0 right-0 p-3 sm:p-0 bg-brand-surface sm:bg-transparent border-t border-brand-gray-200 sm:border-none shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:shadow-none z-40 flex flex-wrap gap-2 w-full sm:w-auto justify-between sm:justify-end items-center">
        
        {/* VIP Cashback Card Trigger (Prominently displayed for invoices) */}
        {isInvoice && onOpenCashback && (
          <button
            type="button"
            onClick={onOpenCashback}
            className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-brand-accent/20 to-brand-accent/30 hover:from-brand-accent/30 hover:to-brand-accent/40 text-brand-navy-950 border border-brand-accent rounded-lg py-2.5 sm:py-2 px-3 text-xs font-extrabold uppercase tracking-wider transition-all shadow-xs shrink-0"
            title="Generate VIP Loyalty Cashback Pass (Lenskart Model)"
          >
            <FaCrown className="w-3.5 h-3.5 text-brand-accent" />
            <span>Cashback Card</span>
          </button>
        )}

        {/* Copy Caption Button */}
        {onCopyCaption && (
          <button
            type="button"
            onClick={handleCopyCaptionClick}
            className="flex items-center justify-center space-x-1.5 bg-white border border-brand-gray-300 hover:border-brand-primary text-brand-primary text-xs font-bold uppercase tracking-wider py-2.5 sm:py-2 px-3 rounded-lg hover:bg-brand-gray-50 transition-all shadow-xs shrink-0"
            title="Copy pre-written message caption to clipboard"
          >
            {captionCopied ? (
              <>
                <FiCheck className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-700">Copied!</span>
              </>
            ) : (
              <>
                <FiCopy className="w-3.5 h-3.5 text-brand-secondary" />
                <span>Copy Caption</span>
              </>
            )}
          </button>
        )}

        {/* Print button (Desktop/Tablet) */}
        <button
          type="button"
          onClick={handlePrint}
          disabled={isGeneratingPdf}
          className="hidden xs:flex items-center justify-center space-x-1 bg-white border border-brand-gray-300 text-brand-navy-900 text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-lg hover:bg-brand-gray-100 transition-all shadow-xs shrink-0 disabled:opacity-50"
          title="Open browser print preview"
        >
          <FiPrinter className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>

        {/* WhatsApp Share button */}
        <button
          type="button"
          onClick={onShareWhatsapp}
          disabled={isGeneratingPdf}
          className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold uppercase tracking-wider py-2.5 sm:py-2 px-3.5 rounded-lg transition-all shadow-xs shrink-0 disabled:opacity-50"
          title="Open in WhatsApp (Desktop App or Mobile)"
        >
          <FaWhatsapp className="w-4 h-4" />
          <span>WhatsApp</span>
        </button>

        {/* Download PDF button */}
        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={isGeneratingPdf}
          className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold uppercase tracking-wider py-2.5 sm:py-2 px-3.5 rounded-lg transition-all shadow-xs shrink-0 disabled:opacity-50"
        >
          <FiDownload className="w-4 h-4" />
          <span>{isGeneratingPdf ? "..." : "PDF"}</span>
        </button>

        {/* New Quotation / Reset button */}
        <button
          type="button"
          onClick={onReset}
          disabled={isGeneratingPdf}
          className="flex items-center justify-center space-x-1 bg-brand-yellow hover:bg-brand-yellow-hover text-brand-navy-900 text-xs font-bold uppercase tracking-wider py-2.5 sm:py-2 px-3 rounded-lg transition-all shadow-xs shrink-0 disabled:opacity-50"
          title="Create New Document"
        >
          <FiPlusCircle className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>
    </div>
  );
}

export default FooterActions;
