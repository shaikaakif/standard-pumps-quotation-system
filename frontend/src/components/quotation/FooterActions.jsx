import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiDownload, FiPlusCircle, FiArrowLeft, FiPrinter, FiCopy, FiCheck } from "react-icons/fi";
import { FaWhatsapp, FaCrown } from "react-icons/fa";

export default function FooterActions({ 
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
    <>
      {/* ========================================================
          1. DESKTOP / TABLET ACTIONS TOOLBAR (In-Flow Container)
          ======================================================== */}
      <div className="hidden sm:flex mt-8 justify-between items-center bg-brand-surface border border-brand-gray-200 rounded-xl p-4 no-print quotation-card-group shadow-sm w-full max-w-[800px] mx-auto">
        {/* Back to Form */}
        <Link
          to="/"
          className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted hover:text-brand-primary transition-colors py-2 px-3 hover:bg-brand-gray-100 rounded-lg shrink-0"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Form</span>
        </Link>

        {/* Desktop Buttons Cluster */}
        <div className="flex items-center space-x-2">
          {/* VIP Cashback Card Trigger */}
          {isInvoice && onOpenCashback && (
            <button
              type="button"
              onClick={onOpenCashback}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-brand-accent/20 to-brand-accent/30 hover:from-brand-accent/30 hover:to-brand-accent/40 text-brand-navy-950 border border-brand-accent rounded-lg py-2 px-3 text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs shrink-0"
              title="Generate VIP Loyalty Cashback Pass"
            >
              <FaCrown className="w-3.5 h-3.5 text-amber-500" />
              <span>Cashback Pass</span>
            </button>
          )}

          {/* Copy Caption */}
          {onCopyCaption && (
            <button
              type="button"
              onClick={handleCopyCaptionClick}
              className="flex items-center space-x-1.5 bg-white border border-brand-gray-300 hover:border-brand-primary text-brand-primary text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-lg hover:bg-brand-gray-50 transition-all shadow-2xs shrink-0"
              title="Copy message caption to clipboard"
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

          {/* Print button */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={isGeneratingPdf}
            className="flex items-center space-x-1.5 bg-white border border-brand-gray-300 text-brand-navy-900 text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-lg hover:bg-brand-gray-100 transition-all shadow-2xs shrink-0 disabled:opacity-50"
            title="Open browser print"
          >
            <FiPrinter className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Download PDF button */}
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center space-x-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold uppercase tracking-wider py-2 px-3.5 rounded-lg transition-all shadow-2xs shrink-0 disabled:opacity-50"
          >
            <FiDownload className="w-4 h-4 text-brand-accent" />
            <span>{isGeneratingPdf ? "Creating..." : "Download PDF"}</span>
          </button>

          {/* WhatsApp Share button */}
          <button
            type="button"
            onClick={onShareWhatsapp}
            disabled={isGeneratingPdf}
            className="flex items-center space-x-1.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-lg transition-all shadow-sm shadow-brand-green/20 shrink-0 disabled:opacity-50"
            title="Share via WhatsApp"
          >
            <FaWhatsapp className="w-4 h-4" />
            <span>Share WhatsApp</span>
          </button>

          {/* New Document */}
          <button
            type="button"
            onClick={onReset}
            disabled={isGeneratingPdf}
            className="flex items-center space-x-1 bg-brand-yellow hover:bg-brand-yellow-hover text-brand-navy-900 text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-lg transition-all shadow-2xs shrink-0 disabled:opacity-50"
            title="Create New Document"
          >
            <FiPlusCircle className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. MOBILE SLEEK SINGLE-ROW DOCK (Anchored at bottom-0)
             Zero clumsy wrapping, zero double-stack overlap!
          ======================================================== */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-md border-t border-brand-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50 flex items-center justify-between gap-1.5 no-print">
        {/* Back */}
        <Link
          to="/"
          className="w-10 h-10 flex items-center justify-center text-brand-muted hover:text-brand-primary bg-brand-gray-100 rounded-xl shrink-0 active:scale-95 transition-all"
          title="Back to Form"
        >
          <FiArrowLeft className="w-4 h-4" />
        </Link>

        {/* VIP Cashback Pass (Invoices) */}
        {isInvoice && onOpenCashback && (
          <button
            type="button"
            onClick={onOpenCashback}
            className="w-10 h-10 flex items-center justify-center text-amber-700 bg-amber-50 border border-amber-200 rounded-xl shrink-0 active:scale-95 transition-all shadow-2xs"
            title="VIP Loyalty Cashback Pass"
          >
            <FaCrown className="w-4 h-4 text-amber-500" />
          </button>
        )}

        {/* Copy Caption */}
        {onCopyCaption && (
          <button
            type="button"
            onClick={handleCopyCaptionClick}
            className="w-10 h-10 flex items-center justify-center text-brand-primary bg-brand-surface border border-brand-gray-300 rounded-xl shrink-0 active:scale-95 transition-all shadow-2xs"
            title="Copy WhatsApp Message Caption"
          >
            {captionCopied ? (
              <FiCheck className="w-4 h-4 text-emerald-600" />
            ) : (
              <FiCopy className="w-4 h-4 text-brand-secondary" />
            )}
          </button>
        )}

        {/* PDF Download Button */}
        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={isGeneratingPdf}
          className="h-10 px-3 flex items-center space-x-1 bg-brand-navy-900 hover:bg-brand-navy-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all active:scale-95 disabled:opacity-50 shadow-2xs"
          title="Download PDF"
        >
          <FiDownload className="w-3.5 h-3.5 text-brand-accent" />
          <span>{isGeneratingPdf ? "..." : "PDF"}</span>
        </button>

        {/* WhatsApp Hero Button */}
        <button
          type="button"
          onClick={onShareWhatsapp}
          disabled={isGeneratingPdf}
          className="h-10 flex-1 flex items-center justify-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-green-600/25 shrink-0 transition-all active:scale-95 disabled:opacity-50"
          title="Share via WhatsApp"
        >
          <FaWhatsapp className="w-4 h-4" />
          <span>WhatsApp</span>
        </button>

        {/* New Document Button */}
        <button
          type="button"
          onClick={onReset}
          disabled={isGeneratingPdf}
          className="w-10 h-10 flex items-center justify-center text-brand-navy-950 bg-brand-yellow hover:bg-yellow-400 rounded-xl shrink-0 active:scale-95 transition-all shadow-2xs"
          title="New Document"
        >
          <FiPlusCircle className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
