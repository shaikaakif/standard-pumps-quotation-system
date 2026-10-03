import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

import { useQuotation } from "../context/QuotationContext";
import { pdfService } from "../services/pdfService";
import { shareService } from "../services/shareService";
import { useLoadingSteps } from "../hooks/useLoadingSteps";
import { useSettings } from "../hooks/useSettings";

import QuotationHeader from "../components/quotation/QuotationHeader";
import CustomerDetails from "../components/quotation/CustomerDetails";
import RecommendationCard from "../components/quotation/RecommendationCard";
import PricingTable from "../components/quotation/PricingTable";
import GrandTotal from "../components/quotation/GrandTotal";
import ImportantNotes from "../components/quotation/ImportantNotes";
import FooterActions from "../components/quotation/FooterActions";
import LoadingOverlay from "../components/system/LoadingOverlay";
import WatermarkBackground from "../components/quotation/WatermarkBackground";
import InvoiceDocument from "../components/invoice/InvoiceDocument";
import CashbackModal from "../components/cashback/CashbackModal";
import { FiAlertCircle, FiArrowLeft, FiGift, FiX } from "react-icons/fi";
import { FaCrown } from "react-icons/fa";

function Preview() {
  const navigate = useNavigate();
  const { 
    quotationResponse, 
    clearQuotation, 
    invoiceData,
    clearInvoice,
    activeDocType,
    isNewQuotation, 
    setIsNewQuotation 
  } = useQuotation();
  
  const { settings } = useSettings();
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isCashbackModalOpen, setIsCashbackModalOpen] = useState(false);
  const [isVipBannerDismissed, setIsVipBannerDismissed] = useState(false);
  const pdfLoader = useLoadingSteps("pdf", 2500);

  const isInvoice = activeDocType === "INVOICE" && Boolean(invoiceData);
  const hasActiveDocument = isInvoice ? Boolean(invoiceData) : Boolean(quotationResponse);

  // Trigger professional confetti particles strictly once after creation
  useEffect(() => {
    if (isNewQuotation && hasActiveDocument) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#102a43", "#1e3a8a", "#fbbf24", "#25d366"], // Navy, Royal Blue, Amber, WhatsApp Green
      });
      const title = isInvoice ? "🎉 Virtual Invoice Generated!" : "🎉 Quotation Generated Successfully!";
      toast.success(title, { duration: 4000 });
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
      setIsNewQuotation(false);
    }
  }, [isNewQuotation, hasActiveDocument, isInvoice, setIsNewQuotation]);

  const handleReset = () => {
    if (isInvoice) {
      clearInvoice();
    } else {
      clearQuotation();
    }
    navigate("/");
  };

  const getDocFilename = () => {
    if (isInvoice) {
      const cleanName = (invoiceData.customer_name || "Customer").replace(/[^a-zA-Z0-9]/g, "_");
      return `Invoice_${cleanName}_${invoiceData.invoice_number}.pdf`;
    }
    const cleanName = (quotationResponse.customer_name || "Customer").replace(/[^a-zA-Z0-9]/g, "_");
    return `Quotation_${cleanName}_${quotationResponse.feet}FT.pdf`;
  };

  const handleDownloadPdf = async () => {
    if (!hasActiveDocument) return;
    const container = document.querySelector(".quotation-container");

    const customFilename = getDocFilename();
    const customerName = isInvoice ? invoiceData.customer_name : quotationResponse.customer_name;
    const depthOrInv = isInvoice ? invoiceData.invoice_number : quotationResponse.feet;

    await pdfService.generateClientPdf(
      container,
      customerName,
      depthOrInv,
      {
        customFilename,
        onStart: () => {
          setIsGeneratingPdf(true);
          pdfLoader.startLoading();
        },
        onComplete: () => {
          pdfLoader.completeLoading();
          setTimeout(() => {
            setIsGeneratingPdf(false);
            toast.success(isInvoice ? "Invoice PDF Generated!" : "Professional Quotation Generated!");
          }, 500);
        },
        onError: (err) => {
          pdfLoader.stopLoading();
          setIsGeneratingPdf(false);
          toast.error(err.message || "PDF generation timed out. Retrying...");
        },
      }
    );
  };

  const generateAttachmentFile = async () => {
    try {
      const container = document.querySelector(".quotation-container");
      if (!container) return null;
      
      const customFilename = getDocFilename();
      const customerName = isInvoice ? invoiceData.customer_name : quotationResponse.customer_name;
      const depthOrInv = isInvoice ? invoiceData.invoice_number : quotationResponse.feet;

      const { blob, filename } = await pdfService.generatePdfBlob(
        container,
        customerName,
        depthOrInv,
        customFilename
      );
      return new File([blob], filename, { type: "application/pdf" });
    } catch (e) {
      console.warn("Could not generate PDF attachment for sharing:", e);
      return null;
    }
  };

  const handleShareWhatsapp = async () => {
    if (!hasActiveDocument) return;
    toast.loading("Preparing PDF attachment...", { id: "share-loader" });
    const pdfFile = await generateAttachmentFile();
    toast.dismiss("share-loader");

    if (isInvoice) {
      await shareService.shareInvoice(invoiceData, { mode: "whatsapp", pdfFile });
    } else {
      await shareService.shareQuotation(quotationResponse, { mode: "whatsapp", pdfFile });
    }
  };

  const handleShare = async () => {
    if (!hasActiveDocument) return;
    toast.loading("Preparing PDF attachment...", { id: "share-loader" });
    const pdfFile = await generateAttachmentFile();
    toast.dismiss("share-loader");

    if (isInvoice) {
      await shareService.shareInvoice(invoiceData, { mode: "all", pdfFile });
    } else {
      await shareService.shareQuotation(quotationResponse, { mode: "all", pdfFile });
    }
  };

  const handleCopyCaption = () => {
    if (isInvoice) {
      const text = shareService.formatInvoiceShareText(invoiceData);
      shareService.copyToClipboard(text, true);
    } else {
      const text = shareService.formatShareText(quotationResponse);
      shareService.copyToClipboard(text, true);
    }
  };

  // 1. Graceful empty-state handling if loaded without context
  if (!hasActiveDocument) {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <div className="bg-white rounded-2xl border border-brand-gray-200 shadow-sm p-6 text-center">
          <div className="bg-brand-accent/15 p-4 rounded-full inline-block mb-4">
            <FiAlertCircle className="w-10 h-10 text-brand-accent" />
          </div>
          <h2 className="text-lg font-bold text-brand-primary uppercase tracking-wide">
            No Active Document Found
          </h2>
          <p className="text-brand-muted text-xs mt-2 leading-relaxed">
            Please create a new Quotation Estimate or Virtual Invoice to preview, print, or download.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 w-full flex items-center justify-center space-x-2 bg-brand-primary text-white py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-colors shadow-sm text-xs uppercase tracking-wider"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Return to Workspace</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full pt-2 pb-20 sm:py-8 relative ${isGeneratingPdf ? "pointer-events-none select-none" : ""}`}>
      
      {/* 2. Top Promotional Banner for Invoices: Sleek Compact VIP Privilege Strip */}
      {isInvoice && !isVipBannerDismissed && (
        <div className="max-w-[800px] mx-auto mb-3 bg-gradient-to-r from-brand-navy-950 via-brand-primary to-brand-navy-900 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-brand-accent/40 shadow-sm flex items-center justify-between gap-2 no-print transition-all">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-accent/20 text-brand-accent flex items-center justify-center border border-brand-accent/30 shrink-0">
              <FaCrown className="w-4 h-4 text-brand-accent" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 truncate">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wide truncate">
                  VIP Cashback Pass
                </span>
                <span className="text-[9px] bg-brand-accent text-brand-navy-950 font-black px-1.5 py-0.5 rounded-full uppercase shrink-0">
                  10% Back
                </span>
              </div>
              <p className="text-[10px] text-brand-navy-200 hidden sm:block">
                Lock in repeat business: 10% Cashback + 1-Year Free Service Guarantee!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsCashbackModalOpen(true)}
              className="flex items-center space-x-1 bg-brand-accent hover:bg-yellow-400 text-brand-navy-950 font-black px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-xs"
            >
              <FiGift className="w-3.5 h-3.5" />
              <span>Create Card</span>
            </button>
            <button
              type="button"
              onClick={() => setIsVipBannerDismissed(true)}
              className="p-1 text-brand-navy-300 hover:text-white rounded-lg transition-colors"
              title="Dismiss banner"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Document Presentation Container */}
      {isInvoice ? (
        // Virtual Invoice View (1-Page)
        <InvoiceDocument invoice={invoiceData} />
      ) : (
        // Borewell Quotation View
        <div className={`quotation-container bg-white border border-brand-gray-200 shadow-sm rounded-xl p-5 sm:p-8 transition-all duration-300 relative overflow-hidden ${isGeneratingPdf ? "opacity-70 blur-[0.5px]" : ""}`}>
          {/* Secure Watermark Layer */}
          <WatermarkBackground text={settings?.business?.shop_name || "STANDARD PUMPS & BOREWELL"} visible={true} />

          {/* Company Header Branding */}
          <QuotationHeader quotationId={quotationResponse.quotation_id} generatedAt={quotationResponse.generated_at} />

          {/* Customer specs card */}
          <CustomerDetails
            customerName={quotationResponse.customer_name}
            phone={quotationResponse.phone}
            feet={quotationResponse.feet}
            mode={quotationResponse.mode}
            phase={quotationResponse.phase || "single"}
          />

          {/* Recommended Submersible motor block */}
          <RecommendationCard motors={quotationResponse.motors} />

          {/* Spreadsheet Table layout */}
          <PricingTable
            pipe={quotationResponse.pipe}
            cable={quotationResponse.cable}
            motors={quotationResponse.motors}
            starter={quotationResponse.starter}
            accessories={quotationResponse.accessories}
            fitting={quotationResponse.fitting}
          />

          {/* Authorized signatures and totals */}
          <GrandTotal totals={quotationResponse.totals} />

          {/* Warranty Notes loaded from configs */}
          <ImportantNotes notes={quotationResponse.summary?.notes} />
        </div>
      )}

      {/* Floating touch-friendly footer options */}
      <FooterActions 
        onReset={handleReset} 
        onDownloadPdf={handleDownloadPdf}
        onShareWhatsapp={handleShareWhatsapp}
        onShare={handleShare}
        onCopyCaption={handleCopyCaption}
        onOpenCashback={() => setIsCashbackModalOpen(true)}
        isInvoice={isInvoice}
        isGeneratingPdf={isGeneratingPdf}
      />

      {/* 4. VIP Cashback Modal */}
      {isInvoice && (
        <CashbackModal
          invoice={invoiceData}
          isOpen={isCashbackModalOpen}
          onClose={() => setIsCashbackModalOpen(false)}
        />
      )}

      {isGeneratingPdf && (
        <LoadingOverlay 
          progress={pdfLoader.progress} 
          message={pdfLoader.currentMessage} 
          type="pdf" 
        />
      )}
    </div>
  );
}

export default Preview;
