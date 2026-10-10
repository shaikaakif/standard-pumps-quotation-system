import React, { useState } from "react";
import { 
  FiX, 
  FiSend, 
  FiZap, 
  FiCheck, 
  FiAlertTriangle, 
  FiCopy, 
  FiExternalLink, 
  FiSettings, 
  FiFileText,
  FiPhone
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ultraMsgService from "../../services/ultraMsgService";

export default function WhatsAppSendModal({
  isOpen,
  onClose,
  customerName,
  phone,
  documentType = "Invoice", // "Invoice" | "Quotation" | "Cashback Pass"
  documentFilename,
  getPdfBlob, // async function returning Blob
  captionText,
  onOpenNativeWhatsApp, // fallback function
}) {
  const navigate = useNavigate();
  const [isSendingCloud, setIsSendingCloud] = useState(false);
  const [cloudSendProgress, setCloudSendProgress] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const isConfigured = ultraMsgService.isConfigured();
  const cleanPhone = (phone || "").replace(/\D/g, "");
  const formattedDisplayPhone = cleanPhone.length === 10 ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}` : (phone || "No Phone");

  const handleCloudSend = async () => {
    if (!isConfigured) {
      toast.error("UltraMsg Gateway is not configured. Please add your credentials in Settings.");
      navigate("/settings");
      return;
    }

    if (!cleanPhone) {
      toast.error("Customer does not have a valid mobile number.");
      return;
    }

    setIsSendingCloud(true);
    setCloudSendProgress("Rendering document PDF...");

    try {
      // 1. Generate document blob
      let pdfBlob = null;
      if (typeof getPdfBlob === "function") {
        pdfBlob = await getPdfBlob();
      }

      setCloudSendProgress("Sending from +91 9110704747 to customer...");

      if (pdfBlob) {
        // Send document with caption
        await ultraMsgService.sendDocument({
          toPhone: cleanPhone,
          filename: documentFilename || `${documentType}.pdf`,
          document: pdfBlob,
          caption: captionText || "",
        });
      } else {
        // Fallback to text message
        await ultraMsgService.sendTextMessage(cleanPhone, captionText);
      }

      setCloudSendProgress("✓ Delivered successfully!");
      toast.success(`✓ ${documentType} sent to ${customerName} (+91 ${cleanPhone.slice(-10)})!`);
      
      setTimeout(() => {
        setIsSendingCloud(false);
        setCloudSendProgress("");
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Cloud send error:", err);
      toast.error(`WhatsApp Bot send failed: ${err.message}`);
      setIsSendingCloud(false);
      setCloudSendProgress("");
    }
  };

  const handleCopyCaption = () => {
    if (!captionText) return;
    navigator.clipboard.writeText(captionText);
    setIsCopied(true);
    toast.success("Caption copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleOpenApp = () => {
    if (typeof onOpenNativeWhatsApp === "function") {
      onOpenNativeWhatsApp();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-navy-900/60 backdrop-blur-sm animate-fade-in no-print">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-brand-gray-300 relative animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-800 text-white p-4 sm:p-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <FiX className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
              <FaWhatsapp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Send via WhatsApp
              </h3>
              <p className="text-xs text-green-100 font-medium">
                Standard Pumps & Borewells Cloud Delivery
              </p>
            </div>
          </div>
        </div>

        {/* Customer & Document Summary Strip */}
        <div className="p-4 bg-brand-gray-50 border-b border-brand-gray-200 text-xs space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-brand-muted font-bold uppercase tracking-wider text-[10px]">Client:</span>
            <span className="font-extrabold text-brand-navy-900 text-sm">{customerName || "Customer"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-brand-muted font-bold uppercase tracking-wider text-[10px]">Destination:</span>
            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {formattedDisplayPhone}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-brand-muted font-bold uppercase tracking-wider text-[10px]">Document:</span>
            <span className="font-semibold text-brand-navy-800 flex items-center gap-1">
              <FiFileText className="text-brand-secondary" />
              <span>{documentFilename || `${documentType}.pdf`}</span>
            </span>
          </div>
        </div>

        {/* Action Choices */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* OPTION 1: CLOUD BOT AUTOMATION (HERO) */}
          <div className={`p-4 rounded-xl border transition-all ${
            isConfigured 
              ? "bg-gradient-to-r from-emerald-50 to-green-50/50 border-emerald-300 shadow-xs" 
              : "bg-gray-50 border-gray-200 opacity-90"
          }`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-2xs">
                  <FiZap className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-brand-navy-950">
                    ⚡ Auto-Send via Cloud Bot
                  </h4>
                  <span className="text-[10px] text-brand-muted font-medium block">
                    Direct from shop number: <strong>+91 9110704747</strong>
                  </span>
                </div>
              </div>

              {isConfigured ? (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  Ready
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate("/settings");
                  }}
                  className="text-[10px] font-bold text-brand-primary bg-white hover:bg-brand-gray-100 px-2 py-1 rounded border border-brand-gray-300 inline-flex items-center gap-1 transition-colors"
                >
                  <FiSettings className="w-3 h-3" />
                  <span>Configure</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-brand-navy-800 mb-3 leading-relaxed">
              Delivers the PDF attachment and formatted caption instantly in the background. You never have to search contacts or attach files manually!
            </p>

            <button
              type="button"
              onClick={handleCloudSend}
              disabled={isSendingCloud || !isConfigured}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <FiSend className={`w-3.5 h-3.5 ${isSendingCloud ? "animate-pulse" : ""}`} />
              <span>{isSendingCloud ? (cloudSendProgress || "Sending...") : "Deliver to Customer Now"}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center space-x-2 my-2 text-brand-muted text-[10px] uppercase font-bold tracking-widest justify-center">
            <span className="h-px bg-brand-gray-200 flex-1" />
            <span>Or Use Personal App</span>
            <span className="h-px bg-brand-gray-200 flex-1" />
          </div>

          {/* OPTION 2: OPEN NATIVE WHATSAPP APP */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenApp}
              className="flex-1 py-2.5 px-3 rounded-xl bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-navy-900 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 active:scale-95 border border-brand-gray-200"
            >
              <FaWhatsapp className="w-4 h-4 text-green-600" />
              <span>Open WhatsApp App</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCaption}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-brand-gray-50 text-brand-navy-800 text-xs font-bold transition-all border border-brand-gray-300 flex items-center justify-center space-x-1 shadow-2xs active:scale-95"
              title="Copy caption text to clipboard"
            >
              {isCopied ? (
                <>
                  <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 text-[11px]">Copied!</span>
                </>
              ) : (
                <>
                  <FiCopy className="w-3.5 h-3.5 text-brand-secondary" />
                  <span className="text-[11px]">Copy Text</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-brand-gray-50 border-t border-brand-gray-200 flex items-center justify-between text-[11px] text-brand-muted">
          <span>Standard Pumps UltraMsg Service</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-brand-navy-900 hover:underline px-2 py-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
