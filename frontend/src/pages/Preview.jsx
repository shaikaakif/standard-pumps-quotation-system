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
import { FiAlertCircle, FiArrowLeft } from "react-icons/fi";

function Preview() {
  const navigate = useNavigate();
  const { quotationResponse, clearQuotation, isNewQuotation, setIsNewQuotation } = useQuotation();
  const { settings } = useSettings();
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfLoader = useLoadingSteps("pdf", 3000);

  // Trigger professional confetti particles strictly once after first estimate creation
  useEffect(() => {
    if (isNewQuotation && quotationResponse) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.65 },
        colors: ["#102a43", "#1e3a8a", "#fbbf24", "#25d366"], // Navy, Royal Blue, Amber, WhatsApp Green
      });
      setIsNewQuotation(false);
    }
  }, [isNewQuotation, quotationResponse, setIsNewQuotation]);

  const handleReset = () => {
    clearQuotation();
    navigate("/");
  };

  const handleDownloadPdf = async () => {
    if (!quotationResponse) return;
    const container = document.querySelector(".quotation-container");

    await pdfService.generatePdf(
      container,
      quotationResponse.customer_name,
      quotationResponse.feet,
      {
        onStart: () => {
          setIsGeneratingPdf(true);
          pdfLoader.startLoading();
        },
        onComplete: () => {
          pdfLoader.completeLoading();
          setTimeout(() => {
            setIsGeneratingPdf(false);
            toast.success("Professional Invoice Generated!");
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

  const handleShareWhatsapp = async () => {
    if (!quotationResponse) return;
    await shareService.shareQuotation(quotationResponse, { mode: "whatsapp" });
  };

  const handleShare = async () => {
    if (!quotationResponse) return;
    await shareService.shareQuotation(quotationResponse, { mode: "all" });
  };

  // 1. Graceful empty-state handling if loaded without context
  if (!quotationResponse) {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <div className="bg-white rounded-lg border border-brand-gray-200 shadow-sm p-6 text-center">
          <div className="bg-brand-yellow/10 p-4 rounded-full inline-block mb-4">
            <FiAlertCircle className="w-10 h-10 text-brand-yellow" />
          </div>
          <h2 className="text-lg font-bold text-brand-navy-800 uppercase tracking-wide">
            No Active Estimate Found
          </h2>
          <p className="text-brand-gray-550 text-xs mt-2 leading-relaxed">
            Please input customer details and feet measurements inside the Estimator to generate a new quotation.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 w-full flex items-center justify-center space-x-2 bg-brand-navy-800 text-white py-2.5 rounded font-bold hover:bg-brand-navy-900 transition-colors shadow-sm text-xs uppercase tracking-wider"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Return to Estimator</span>
          </button>
        </div>
      </div>
    );
  }

  const {
    quotation_id,
    generated_at,
    customer_name,
    phone,
    feet,
    mode,
    pipe,
    cable,
    starter,
    accessories,
    fitting,
    motors,
    totals,
  } = quotationResponse;

  return (
    <div className={`w-full py-4 sm:py-8 relative ${isGeneratingPdf ? "pointer-events-none select-none" : ""}`}>
      {/* 2. Premium Print-Safe A4 Quotation Box */}
      <div className={`quotation-container bg-white border border-brand-gray-200 shadow-sm rounded-lg p-5 sm:p-8 transition-all duration-300 relative overflow-hidden ${isGeneratingPdf ? "opacity-70 blur-[0.5px]" : ""}`}>
        
        {/* Secure Watermark Layer */}
        <WatermarkBackground text={settings?.business?.shop_name || "STANDARD PUMPS & BOREWELL"} visible={true} />

        {/* Company Header Branding */}
        <QuotationHeader quotationId={quotation_id} generatedAt={generated_at} />

        {/* Customer specs card */}
        <CustomerDetails
          customerName={customer_name}
          phone={phone}
          feet={feet}
          mode={mode}
          phase={quotationResponse.phase || "single"}
        />

        {/* Recommended Submersible motor block */}
        <RecommendationCard motors={motors} />

        {/* Spreadsheet Table layout */}
        <PricingTable
          pipe={pipe}
          cable={cable}
          motors={motors}
          starter={starter}
          accessories={accessories}
          fitting={fitting}
        />

        {/* Authorized signatures and totals */}
        <GrandTotal totals={totals} />

        {/* Warranty Notes loaded from configs */}
        <ImportantNotes notes={quotationResponse.summary?.notes} />
      </div>

      {/* Floating touch-friendly footer options */}
      <FooterActions 
        onReset={handleReset} 
        onDownloadPdf={handleDownloadPdf}
        onShareWhatsapp={handleShareWhatsapp}
        onShare={handleShare}
        isGeneratingPdf={isGeneratingPdf}
      />

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
